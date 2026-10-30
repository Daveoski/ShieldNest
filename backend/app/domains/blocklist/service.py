"""Downloads and caches the upstream lists."""

import time
import urllib.request

from app.core.config import USER_AGENT
from app.domains.blocklist.parsing import is_blocked, parse_hosts
from app.domains.blocklist.sources import SOURCES, Category

CACHE_TTL_SECONDS = 6 * 60 * 60


class UpstreamUnavailable(Exception):
    def __init__(self, url: str):
        super().__init__(f"Upstream list unavailable: {url}")
        self.url = url


_cache: dict[str, tuple[float, frozenset[str]]] = {}


def _fetch(url: str) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
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
            raise UpstreamUnavailable(url)

    result = frozenset(domains)
    _cache[category] = (time.time(), result)
    return result


def load(category: Category) -> frozenset[str]:
    if category is Category.all:
        return frozenset().union(*(load_category(name) for name in SOURCES))
    return load_category(category.value)


def stats() -> tuple[dict[str, int], int]:
    """Domain count per category, plus the de-duplicated total."""
    lists = {name: load_category(name) for name in SOURCES}
    return {name: len(domains) for name, domains in lists.items()}, len(frozenset().union(*lists.values()))


def check(domain: str) -> tuple[str, str] | None:
    """Return (category, matching entry) for the first list that blocks the domain."""
    for name in SOURCES:
        match = is_blocked(domain, load_category(name))
        if match:
            return name, match
    return None
