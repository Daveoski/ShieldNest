"""Runs the proxy on a high port (no admin needed) and queries it like a real client."""

import socket

import pytest

from shieldnest_windows.proxy import DnsProxy
from tests.test_dns import dns_query

PORT = 15353


@pytest.fixture
def proxy():
    blocked: list[str] = []
    p = DnsProxy(is_blocked=lambda name: name.endswith("doubleclick.net"), on_blocked=blocked.append)
    p.start(port=PORT)
    p.blocked = blocked
    yield p
    p.stop()


def udp_ask(name: str) -> bytes:
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(10)
        sock.sendto(dns_query(name), ("127.0.0.1", PORT))
        return sock.recvfrom(4096)[0]


def test_blocked_name_gets_nxdomain(proxy):
    reply = udp_ask("ads.doubleclick.net")
    assert reply[3] & 0x0F == 3
    assert proxy.blocked == ["ads.doubleclick.net"]


def test_allowed_name_is_resolved_upstream(proxy):
    reply = udp_ask("example.com")
    assert reply[:2] == b"\x12\x34"
    assert reply[3] & 0x0F == 0  # NOERROR
    assert int.from_bytes(reply[6:8], "big") >= 1  # has an answer
    assert proxy.blocked == []


def test_tcp_queries_work(proxy):
    query = dns_query("example.com")
    with socket.create_connection(("127.0.0.1", PORT), timeout=10) as sock:
        sock.sendall(len(query).to_bytes(2, "big") + query)
        length = int.from_bytes(sock.recv(2), "big")
        reply = b""
        while len(reply) < length:
            reply += sock.recv(length - len(reply))
    assert reply[3] & 0x0F == 0
