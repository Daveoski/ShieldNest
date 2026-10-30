package com.shieldnest.app.vpn

/**
 * Minimal IPv4/UDP/DNS handling for the DNS-only VPN tunnel.
 * Only what is needed to read a query name and send a reply back into the tunnel.
 */
object DnsPacket {

    class UdpQuery(
        val srcIp: ByteArray,
        val dstIp: ByteArray,
        val srcPort: Int,
        val dstPort: Int,
        val payload: ByteArray,
    )

    class Question(val name: String, val end: Int)

    private const val IPV4_HEADER = 20
    private const val UDP_HEADER = 8
    private const val DNS_HEADER = 12

    /** Returns the DNS query in an IPv4 UDP packet sent to port 53, or null for anything else. */
    fun parseUdp(packet: ByteArray): UdpQuery? {
        if (packet.size < IPV4_HEADER + UDP_HEADER) return null
        if ((packet[0].toInt() shr 4) != 4) return null
        val ihl = (packet[0].toInt() and 0x0F) * 4
        if (packet[9].toInt() != 17 || packet.size < ihl + UDP_HEADER) return null

        val srcPort = u16(packet, ihl)
        val dstPort = u16(packet, ihl + 2)
        val udpLength = u16(packet, ihl + 4)
        if (dstPort != 53 || udpLength < UDP_HEADER || ihl + udpLength > packet.size) return null

        return UdpQuery(
            srcIp = packet.copyOfRange(12, 16),
            dstIp = packet.copyOfRange(16, 20),
            srcPort = srcPort,
            dstPort = dstPort,
            payload = packet.copyOfRange(ihl + UDP_HEADER, ihl + udpLength),
        )
    }

    /** Reads the first question's name (lowercase) and where the question section ends. */
    fun parseQuestion(dns: ByteArray): Question? {
        if (dns.size < DNS_HEADER + 5 || u16(dns, 4) < 1) return null
        val name = StringBuilder()
        var i = DNS_HEADER
        while (i < dns.size) {
            val length = dns[i].toInt() and 0xFF
            if (length == 0) {
                val end = i + 1 + 4 // root label + QTYPE + QCLASS
                if (name.isEmpty() || end > dns.size) return null
                return Question(name.toString().lowercase(), end)
            }
            // Compression pointers never appear in a query's question name
            if (length and 0xC0 != 0 || i + 1 + length > dns.size) return null
            if (name.isNotEmpty()) name.append('.')
            name.append(String(dns, i + 1, length, Charsets.US_ASCII))
            i += 1 + length
        }
        return null
    }

    /** Builds an NXDOMAIN reply that echoes the query's ID and question. */
    fun nxdomain(query: ByteArray, question: Question): ByteArray {
        val reply = query.copyOf(question.end)
        reply[2] = (0x80 or (query[2].toInt() and 0x79)).toByte() // QR + opcode + RD
        reply[3] = (0x80 or 3).toByte() // RA + RCODE 3 (NXDOMAIN)
        reply[4] = 0; reply[5] = 1 // QDCOUNT
        for (i in 6 until DNS_HEADER) reply[i] = 0 // ANCOUNT, NSCOUNT, ARCOUNT
        return reply
    }

    /** Wraps a DNS reply in IPv4/UDP headers addressed back to whoever sent the query. */
    fun wrapResponse(query: UdpQuery, dns: ByteArray): ByteArray {
        val total = IPV4_HEADER + UDP_HEADER + dns.size
        val out = ByteArray(total)
        out[0] = 0x45
        put16(out, 2, total)
        out[6] = 0x40 // don't fragment
        out[8] = 64 // TTL
        out[9] = 17 // UDP
        query.dstIp.copyInto(out, 12)
        query.srcIp.copyInto(out, 16)
        put16(out, 10, checksum(out, 0, IPV4_HEADER))

        put16(out, 20, query.dstPort)
        put16(out, 22, query.srcPort)
        put16(out, 24, UDP_HEADER + dns.size)
        // UDP checksum 0 = not computed, which IPv4 allows
        dns.copyInto(out, IPV4_HEADER + UDP_HEADER)
        return out
    }

    internal fun checksum(data: ByteArray, offset: Int, length: Int): Int {
        var sum = 0
        for (i in offset until offset + length step 2) {
            sum += u16(data, i)
        }
        while (sum shr 16 != 0) sum = (sum and 0xFFFF) + (sum shr 16)
        return sum.inv() and 0xFFFF
    }

    private fun u16(data: ByteArray, offset: Int): Int =
        ((data[offset].toInt() and 0xFF) shl 8) or (data[offset + 1].toInt() and 0xFF)

    private fun put16(data: ByteArray, offset: Int, value: Int) {
        data[offset] = (value shr 8).toByte()
        data[offset + 1] = value.toByte()
    }
}
