from shieldnest_windows.blocklist import match
from shieldnest_windows.dns import nxdomain, parse_question


def dns_query(name: str) -> bytes:
    """A standard A-record query with ID 0x1234 and recursion desired."""
    header = bytes([0x12, 0x34, 0x01, 0x00, 0, 1, 0, 0, 0, 0, 0, 0])
    labels = b"".join(bytes([len(p)]) + p.encode() for p in name.split("."))
    return header + labels + bytes([0, 0, 1, 0, 1])


def test_parse_question_lowercases_name():
    question = parse_question(dns_query("Ads.Example.COM"))
    assert question is not None
    assert question.name == "ads.example.com"


def test_parse_question_rejects_malformed():
    assert parse_question(b"\x00" * 5) is None
    assert parse_question(dns_query("example.com")[:-3]) is None


def test_nxdomain_echoes_id_and_question():
    query = dns_query("tracker.net")
    reply = nxdomain(query, parse_question(query))
    assert reply[:2] == b"\x12\x34"
    assert reply[2] == 0x81  # QR + RD
    assert reply[3] == 0x83  # RA + NXDOMAIN
    assert reply[4:12] == bytes([0, 1, 0, 0, 0, 0, 0, 0])
    assert reply[12:] == query[12:]


def test_match_parent_domains_but_not_tlds():
    blocklist = {"doubleclick.net", "net"}
    assert match("stats.g.doubleclick.net", blocklist) == "doubleclick.net"
    assert match("net", blocklist) is None
    assert match("example.com", blocklist) is None
