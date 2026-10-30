"""ShieldNest blocklist API.

Aggregates public ad, tracker and malware domain lists so the ShieldNest
apps can download one merged list and filter DNS on the device.

Runs on Vercel as a Python function; locally with:
    uvicorn api.index:app --reload --port 8000
"""

import time
import urllib.request
from enum import Enum

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse

SOURCES: dict[str, list[str]] = {
    # StevenBlack unified hosts: ads + trackers from several curated lists
    "ads": ["https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"],
    # malware-filter project: URLhaus domains currently serving malware and ransomware
    "malware": ["https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-hosts.txt"],
    # malware-filter project: PhishTank, OpenPhish and PhishStats phishing domains
    "phishing": ["https://malware-filter.gitlab.io/malware-filter/phishing-filter-hosts.txt"],
}

CACHE_TTL_SECONDS = 6 * 60 * 60
CDN_CACHE_HEADER = f"public, s-maxage={CACHE_TTL_SECONDS}, stale-while-revalidate=86400"

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


class Category(str, Enum):
    ads = "ads"
    malware = "malware"
    phishing = "phishing"
    all = "all"


_cache: dict[str, tuple[float, frozenset[str]]] = {}

app = FastAPI(
    title="ShieldNest API",
    docs_url="/api/py/docs",
    openapi_url="/api/py/openapi.json",
)


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


def _fetch(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "ShieldNest/0.1"})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read().decode("utf-8", errors="ignore")


def load_category(category: str) -> frozenset[str]:
    cached = _cache.get(category)
    if cached and time.time() - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]

    domains: set[str] = set()
    for url in SOURCES[category]:
        try:
            domains |= parse_hosts(_fetch(url))
        except OSError:
            # Keep serving the last good list if an upstream source is down
            if cached:
                return cached[1]
            raise HTTPException(status_code=502, detail=f"Upstream list unavailable: {url}")

    result = frozenset(domains)
    _cache[category] = (time.time(), result)
    return result


def load(category: Category) -> frozenset[str]:
    if category is Category.all:
        return frozenset().union(*(load_category(name) for name in SOURCES))
    return load_category(category.value)


@app.get("/api/py/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/py/blocklist")
def blocklist(
    response: Response,
    category: Category = Category.all,
    format: str = Query("json", pattern="^(json|txt)$"),
):
    domains = sorted(load(category))
    if format == "txt":
        return PlainTextResponse("\n".join(domains), headers={"Cache-Control": CDN_CACHE_HEADER})
    response.headers["Cache-Control"] = CDN_CACHE_HEADER
    return {"category": category.value, "count": len(domains), "domains": domains}


@app.get("/api/py/check")
def check(domain: str = Query(..., min_length=3, max_length=253)) -> dict[str, object]:
    for name in SOURCES:
        match = is_blocked(domain, load_category(name))
        if match:
            return {"domain": domain, "blocked": True, "category": name, "match": match}
    return {"domain": domain, "blocked": False}
