"""Pure helpers for reading hosts files and matching domains."""

# Entries in hosts files that must never be treated as blocked domains
IGNORED_HOSTS = {
    "localhost",
    "localhost.localdomain",
    "local",
    "broadcasthost",
    "ip6-localhost",
    "ip6-loopback",
    "0.0.0.0",
}


def parse_hosts(text: str) -> set[str]:
    """Extract domains from a hosts-format or plain domain-per-line list."""
    domains: set[str] = set()
    for line in text.splitlines():
        line = line.split("#", 1)[0].strip()
        if not line:
            continue
        parts = line.split()
        host = parts[1] if len(parts) > 1 else parts[0]
        host = host.lower().rstrip(".")
        if host in IGNORED_HOSTS or "." not in host:
            continue
        domains.add(host)
    return domains


def is_blocked(domain: str, blocklist: frozenset[str] | set[str]) -> str | None:
    """Return the matching blocklist entry if the domain or a parent domain is listed."""
    labels = domain.lower().rstrip(".").split(".")
    for i in range(len(labels) - 1):
        candidate = ".".join(labels[i:])
        if candidate in blocklist:
            return candidate
    return None
