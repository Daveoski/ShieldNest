"""Optional ShieldNest account sign-in, using the website's device flow.

The app shows a code, the user approves it at /device (with Google or email), and the app
receives a session token. Protection works the same whether or not the user is signed in.
The token is encrypted with Windows DPAPI so only this Windows user can read it.
"""

import ctypes
import ctypes.wintypes
import json
import time
import urllib.error
import urllib.request
from dataclasses import dataclass

from shieldnest_windows.blocklist import DATA_DIR

BASE_URL = "https://shieldnest-delta.vercel.app/api/auth"
CLIENT_ID = "shieldnest-windows"
ACCOUNT_FILE = DATA_DIR / "account.bin"


@dataclass(frozen=True)
class User:
    name: str
    email: str


@dataclass(frozen=True)
class DeviceCode:
    device_code: str
    user_code: str
    verification_url: str
    interval: int

    @property
    def display_code(self) -> str:
        """Shown as ABCD-1234 to match the website."""
        c = self.user_code
        return f"{c[:4]}-{c[4:]}" if len(c) == 8 else c


class SignInError(Exception):
    pass


def _request(path: str, body: dict | None = None, token: str | None = None) -> tuple[int, dict]:
    headers = {"Content-Type": "application/json", "User-Agent": "ShieldNest-Windows/0.1"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(BASE_URL + path, data=data, headers=headers, method="POST" if data else "GET")
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status, json.loads(response.read() or b"null") or {}
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b"{}")
        except ValueError:
            return e.code, {}


def request_code() -> DeviceCode:
    try:
        status, data = _request("/device/code", {"client_id": CLIENT_ID})
    except OSError:
        raise SignInError("Couldn't reach ShieldNest. Check your internet connection.")
    if status != 200:
        raise SignInError("Couldn't start sign-in. Please try again.")
    return DeviceCode(data["device_code"], data["user_code"], data["verification_uri_complete"], data.get("interval", 5))


def await_approval(code: DeviceCode, cancelled=lambda: False) -> User:
    """Poll until the user approves on the website; raises SignInError if denied, expired or cancelled."""
    interval = code.interval
    while True:
        time.sleep(interval)
        if cancelled():
            raise SignInError("Sign-in cancelled.")
        try:
            status, data = _request("/device/token", {
                "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
                "device_code": code.device_code,
                "client_id": CLIENT_ID,
            })
        except OSError:
            continue  # brief network drop: keep waiting
        if status == 200:
            token = data["access_token"]
            _, session = _request("/get-session", token=token)
            user = User(session["user"].get("name", ""), session["user"]["email"])
            _save({"token": token, "name": user.name, "email": user.email})
            return user
        error = data.get("error")
        if error == "authorization_pending":
            continue
        if error == "slow_down":
            interval += 5
            continue
        if error == "access_denied":
            raise SignInError("Sign-in was denied on the website.")
        raise SignInError("The code expired. Please try again.")


def current_user() -> User | None:
    saved = _load()
    return User(saved["name"], saved["email"]) if saved else None


def sign_out() -> None:
    saved = _load()
    if saved:
        try:
            _request("/sign-out", {}, token=saved["token"])
        except OSError:
            pass  # offline: the token still expires on the server by itself
    ACCOUNT_FILE.unlink(missing_ok=True)


def _save(data: dict) -> None:
    ACCOUNT_FILE.parent.mkdir(parents=True, exist_ok=True)
    ACCOUNT_FILE.write_bytes(_dpapi(json.dumps(data).encode(), protect=True))


def _load() -> dict | None:
    try:
        return json.loads(_dpapi(ACCOUNT_FILE.read_bytes(), protect=False))
    except (OSError, ValueError):
        return None


class _Blob(ctypes.Structure):
    _fields_ = [("cbData", ctypes.wintypes.DWORD), ("pbData", ctypes.POINTER(ctypes.c_char))]


def _dpapi(data: bytes, protect: bool) -> bytes:
    """Encrypt/decrypt with the current Windows user's DPAPI key."""
    buffer = ctypes.create_string_buffer(data, len(data))
    blob_in = _Blob(len(data), ctypes.cast(buffer, ctypes.POINTER(ctypes.c_char)))
    blob_out = _Blob()
    crypt32 = ctypes.windll.crypt32
    fn = crypt32.CryptProtectData if protect else crypt32.CryptUnprotectData
    if not fn(ctypes.byref(blob_in), None, None, None, None, 0, ctypes.byref(blob_out)):
        raise OSError("DPAPI failed")
    try:
        return ctypes.string_at(blob_out.pbData, blob_out.cbData)
    finally:
        ctypes.windll.kernel32.LocalFree(blob_out.pbData)
