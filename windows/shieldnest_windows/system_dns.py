"""Points Windows' DNS at the local proxy and puts the original settings back afterwards.

The original settings are saved to disk before anything changes, so they can be
restored on the next launch even if the app or the PC crashed while protection was on.
"""

import json
import subprocess
import winreg

from shieldnest_windows.blocklist import DATA_DIR

BACKUP_FILE = DATA_DIR / "dns-backup.json"
LOCAL_DNS = ("127.0.0.1", "::1")

_TCPIP_KEYS = (
    r"SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces",
    r"SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters\Interfaces",
)


def _powershell(script: str) -> str:
    result = subprocess.run(
        ["powershell", "-NoProfile", "-NonInteractive", "-Command", script],
        capture_output=True,
        text=True,
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "PowerShell command failed")
    return result.stdout


def _active_adapters() -> list[dict]:
    output = _powershell(
        "Get-NetAdapter | Where-Object Status -eq 'Up' | "
        "Select-Object ifIndex, InterfaceGuid, Name | ConvertTo-Json -Compress"
    )
    if not output.strip():
        return []
    adapters = json.loads(output)
    return adapters if isinstance(adapters, list) else [adapters]


def _static_servers(interface_guid: str) -> list[str]:
    """DNS servers typed in by hand for this adapter; empty means they come from DHCP."""
    servers: list[str] = []
    for key_path in _TCPIP_KEYS:
        try:
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, rf"{key_path}\{interface_guid}") as key:
                value, _ = winreg.QueryValueEx(key, "NameServer")
        except OSError:
            continue
        servers += [s for s in value.replace(",", " ").split() if s]
    return servers


def _set_servers(if_index: int, servers: list[str]) -> None:
    quoted = ",".join(f"'{s}'" for s in servers)
    _powershell(f"Set-DnsClientServerAddress -InterfaceIndex {int(if_index)} -ServerAddresses @({quoted})")


def _reset_servers(if_index: int) -> None:
    _powershell(f"Set-DnsClientServerAddress -InterfaceIndex {int(if_index)} -ResetServerAddresses")


def _flush() -> None:
    subprocess.run(["ipconfig", "/flushdns"], capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW)


def enable() -> None:
    adapters = _active_adapters()
    if not adapters:
        raise RuntimeError("No active network connection found.")

    # An existing backup means a previous session never restored; keep those original values
    if not BACKUP_FILE.exists():
        backup = [
            {
                "ifIndex": a["ifIndex"],
                "name": a["Name"],
                "static": _static_servers(a["InterfaceGuid"]),
            }
            for a in adapters
        ]
        BACKUP_FILE.parent.mkdir(parents=True, exist_ok=True)
        BACKUP_FILE.write_text(json.dumps(backup, indent=2), encoding="utf-8")

    for adapter in adapters:
        _set_servers(adapter["ifIndex"], list(LOCAL_DNS))
    _flush()


def disable() -> None:
    if not BACKUP_FILE.exists():
        return
    backup = json.loads(BACKUP_FILE.read_text(encoding="utf-8"))
    for adapter in backup:
        try:
            # Reset to DHCP first, then re-apply any servers the user had typed in
            _reset_servers(adapter["ifIndex"])
            if adapter["static"]:
                _set_servers(adapter["ifIndex"], adapter["static"])
        except RuntimeError:
            pass  # adapter was removed since protection was turned on
    BACKUP_FILE.unlink()
    _flush()


def needs_recovery() -> bool:
    return BACKUP_FILE.exists()
