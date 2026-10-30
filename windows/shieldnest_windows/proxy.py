"""Local DNS server: answers NXDOMAIN for blocked names and forwards the rest upstream."""

import socket
import socketserver
import threading
from collections.abc import Callable

from shieldnest_windows.dns import nxdomain, parse_question

# Cloudflare 1.1.1.2 also blocks malware at the resolver: a second layer of protection
UPSTREAM_DNS = "1.1.1.2"
UPSTREAM_TIMEOUT = 5.0


class DnsProxy:
    def __init__(
        self,
        is_blocked: Callable[[str], bool],
        on_blocked: Callable[[str], None] = lambda name: None,
        upstream: str = UPSTREAM_DNS,
    ):
        self.is_blocked = is_blocked
        self.on_blocked = on_blocked
        self.upstream = upstream
        self._servers: list[socketserver.BaseServer] = []

    def answer(self, query: bytes, tcp: bool = False) -> bytes | None:
        question = parse_question(query)
        if question and self.is_blocked(question.name):
            self.on_blocked(question.name)
            return nxdomain(query, question)
        try:
            return self._forward_tcp(query) if tcp else self._forward_udp(query)
        except OSError:
            return None  # the client's resolver will retry

    def start(self, port: int = 53) -> None:
        """Listen on UDP and TCP for both 127.0.0.1 and ::1 (IPv6 is skipped if unavailable)."""
        proxy = self

        class UdpHandler(socketserver.BaseRequestHandler):
            def handle(self):
                data, sock = self.request
                reply = proxy.answer(data)
                if reply:
                    sock.sendto(reply, self.client_address)

        class TcpHandler(socketserver.BaseRequestHandler):
            def handle(self):
                length = int.from_bytes(_recv_exact(self.request, 2), "big")
                reply = proxy.answer(_recv_exact(self.request, length), tcp=True)
                if reply:
                    self.request.sendall(len(reply).to_bytes(2, "big") + reply)

        for host, family in (("127.0.0.1", socket.AF_INET), ("::1", socket.AF_INET6)):
            for base, handler in (
                (socketserver.ThreadingUDPServer, UdpHandler),
                (socketserver.ThreadingTCPServer, TcpHandler),
            ):
                server_class = type("Server", (base,), {"address_family": family, "daemon_threads": True})
                try:
                    server = server_class((host, port), handler)
                except OSError:
                    if family == socket.AF_INET:
                        self.stop()
                        raise
                    continue  # IPv6 loopback disabled on this PC
                self._servers.append(server)
                threading.Thread(target=server.serve_forever, daemon=True).start()

    def stop(self) -> None:
        for server in self._servers:
            server.shutdown()
            server.server_close()
        self._servers.clear()

    def _forward_udp(self, query: bytes) -> bytes:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
            sock.settimeout(UPSTREAM_TIMEOUT)
            sock.sendto(query, (self.upstream, 53))
            reply, _ = sock.recvfrom(4096)
            return reply

    def _forward_tcp(self, query: bytes) -> bytes:
        with socket.create_connection((self.upstream, 53), timeout=UPSTREAM_TIMEOUT) as sock:
            sock.sendall(len(query).to_bytes(2, "big") + query)
            length = int.from_bytes(_recv_exact(sock, 2), "big")
            return _recv_exact(sock, length)


def _recv_exact(sock: socket.socket, size: int) -> bytes:
    data = b""
    while len(data) < size:
        chunk = sock.recv(size - len(data))
        if not chunk:
            raise ConnectionError("connection closed")
        data += chunk
    return data
