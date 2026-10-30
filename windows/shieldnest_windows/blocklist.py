"""The merged ad, tracker, malware and phishing domain list served by the ShieldNest API."""

import os
import time
import urllib.request
from pathlib import Path

SOURCE_URL = "https://shieldnest-delta.vercel.app/api/py/blocklist?category=all&format=txt"
MAX_AGE_SECONDS = 24 * 60 * 60

DATA_DIR = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "ShieldNest"


def match(domain: str, blocklist: frozenset[str] | set[str]) -> str | None:
    """Return the listed entry that blocks this domain or a parent domain, or None."""
    labels = domain.lower().rstrip(".").split(".")
    # Check the domain and each parent, but never a bare TLD
    for i in range(len(labels) - 1):
        candidate = ".".join(labels[i:])
        if candidate in blocklist:
            return candidate
    return None


class Blocklist:
    def __init__(self, data_dir: Path = DATA_DIR):
        self.file = data_dir / "blocklist.txt"
        self.domains: frozenset[str] = frozenset()
        self.warning: str | None = None

    def load(self) -> None:
        """Load the cached list, downloading a fresh copy first if it is missing or over a day old."""
        self.warning = None
        stale = not self.file.exists() or time.time() - self.file.stat().st_mtime > MAX_AGE_SECONDS
        if stale:
            try:
                self._download()
            except OSError:
                self.warning = (
                    "Couldn't update the blocklist, so the saved copy is in use."
                    if self.file.exists()
                    else "Couldn't download the blocklist. Only Cloudflare malware filtering is active."
                )

        if self.file.exists():
            with self.file.open(encoding="utf-8") as f:
                self.domains = frozenset(line.strip().lower() for line in f if line.strip())
        else:
            self.domains = frozenset()

    def match(self, domain: str) -> str | None:
        return match(domain, self.domains)

    def _download(self) -> None:
        self.file.parent.mkdir(parents=True, exist_ok=True)
        request = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "ShieldNest-Windows/0.1"})
        temp = self.file.with_suffix(".tmp")
        with urllib.request.urlopen(request, timeout=30) as response, temp.open("wb") as out:
            out.write(response.read())
        temp.replace(self.file)
