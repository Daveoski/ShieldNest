"""Minimal DNS message handling: read a query's name and build an NXDOMAIN reply."""

from dataclasses import dataclass

DNS_HEADER = 12


@dataclass(frozen=True)
class Question:
    name: str
    end: int  # offset just past QTYPE + QCLASS


def parse_question(message: bytes) -> Question | None:
    """Read the first question's name (lowercase), or None if the message is malformed."""
    if len(message) < DNS_HEADER + 5 or int.from_bytes(message[4:6], "big") < 1:
        return None
    labels: list[str] = []
    i = DNS_HEADER
    while i < len(message):
        length = message[i]
        if length == 0:
            end = i + 1 + 4  # root label + QTYPE + QCLASS
            if not labels or end > len(message):
                return None
            return Question(".".join(labels).lower(), end)
        # Compression pointers never appear in a query's question name
        if length & 0xC0 or i + 1 + length > len(message):
            return None
        labels.append(message[i + 1 : i + 1 + length].decode("ascii", errors="replace"))
        i += 1 + length
    return None


def nxdomain(query: bytes, question: Question) -> bytes:
    """Build an NXDOMAIN reply that echoes the query's ID and question."""
    flags = bytes([
        0x80 | (query[2] & 0x79),  # QR + opcode + RD
        0x80 | 3,  # RA + RCODE 3 (NXDOMAIN)
    ])
    counts = (1).to_bytes(2, "big") + bytes(6)  # QDCOUNT=1, AN/NS/AR=0
    return query[:2] + flags + counts + query[DNS_HEADER : question.end]
