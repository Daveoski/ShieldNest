from api.index import is_blocked, parse_hosts

HOSTS_SAMPLE = """
# comment line
127.0.0.1 localhost
0.0.0.0 0.0.0.0
0.0.0.0 ads.example.com
0.0.0.0 Tracker.Example.NET.  # trailing comment
127.0.0.1\tmalware.bad
plain-domain.org
nodot
"""


def test_parse_hosts_extracts_domains():
    assert parse_hosts(HOSTS_SAMPLE) == {
        "ads.example.com",
        "tracker.example.net",
        "malware.bad",
        "plain-domain.org",
    }


def test_is_blocked_matches_parent_domain():
    blocklist = {"doubleclick.net"}
    assert is_blocked("stats.g.doubleclick.net", blocklist) == "doubleclick.net"
    assert is_blocked("DoubleClick.net.", blocklist) == "doubleclick.net"


def test_is_blocked_ignores_unrelated_and_tld_only():
    blocklist = {"doubleclick.net"}
    assert is_blocked("example.com", blocklist) is None
    assert is_blocked("net", {"net"}) is None
