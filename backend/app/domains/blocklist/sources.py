"""Upstream domain lists that make up each blocklist category."""

from enum import Enum

SOURCES: dict[str, list[str]] = {
    # StevenBlack unified hosts: ads + trackers from several curated lists
    "ads": ["https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"],
    # malware-filter project: URLhaus domains currently serving malware and ransomware
    "malware": ["https://malware-filter.gitlab.io/malware-filter/urlhaus-filter-hosts.txt"],
    # malware-filter project: PhishTank, OpenPhish and PhishStats phishing domains
    "phishing": ["https://malware-filter.gitlab.io/malware-filter/phishing-filter-hosts.txt"],
}


class Category(str, Enum):
    ads = "ads"
    malware = "malware"
    phishing = "phishing"
    all = "all"
