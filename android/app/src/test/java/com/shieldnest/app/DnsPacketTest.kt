package com.shieldnest.app

import com.shieldnest.app.data.Blocklist
import com.shieldnest.app.vpn.DnsPacket
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class DnsPacketTest {

    private val clientIp = byteArrayOf(10, 111, 222.toByte(), 1)
    private val dnsIp = byteArrayOf(10, 111, 222.toByte(), 2)

    /** A standard A-record query for [name] with ID 0x1234 and recursion desired. */
    private fun dnsQuery(name: String): ByteArray {
        val header = byteArrayOf(0x12, 0x34, 0x01, 0x00, 0, 1, 0, 0, 0, 0, 0, 0)
        val labels = name.split('.').flatMap { listOf(it.length.toByte()) + it.toByteArray().toList() }
        return header + labels.toByteArray() + byteArrayOf(0, 0, 1, 0, 1)
    }

    private fun ipv4Udp(dns: ByteArray, dstPort: Int = 53): ByteArray {
        val query = DnsPacket.UdpQuery(dnsIp, clientIp, dstPort, 40000, dns)
        // wrapResponse swaps addresses and ports, so swap them in to get a client->DNS packet
        return DnsPacket.wrapResponse(query, dns)
    }

    @Test
    fun parsesQueryFromIpv4UdpPacket() {
        val query = DnsPacket.parseUdp(ipv4Udp(dnsQuery("ads.example.com")))
        assertNotNull(query)
        assertEquals(40000, query!!.srcPort)
        assertArrayEquals(clientIp, query.srcIp)
        assertEquals("ads.example.com", DnsPacket.parseQuestion(query.payload)?.name)
    }

    @Test
    fun ignoresNonDnsTraffic() {
        assertNull(DnsPacket.parseUdp(ipv4Udp(dnsQuery("example.com"), dstPort = 443)))
        assertNull(DnsPacket.parseUdp(ByteArray(10)))
    }

    @Test
    fun questionNameIsLowercased() {
        assertEquals("ads.example.com", DnsPacket.parseQuestion(dnsQuery("Ads.Example.COM"))?.name)
    }

    @Test
    fun nxdomainEchoesIdAndQuestion() {
        val dns = dnsQuery("tracker.net")
        val question = DnsPacket.parseQuestion(dns)!!
        val reply = DnsPacket.nxdomain(dns, question)

        assertEquals(0x12, reply[0].toInt())
        assertEquals(0x34, reply[1].toInt())
        assertEquals(0x81, reply[2].toInt() and 0xFF) // QR + RD
        assertEquals(0x83, reply[3].toInt() and 0xFF) // RA + NXDOMAIN
        assertArrayEquals(dns.copyOfRange(12, dns.size), reply.copyOfRange(12, reply.size))
    }

    @Test
    fun responseIsAddressedBackToClientWithValidChecksum() {
        val query = DnsPacket.parseUdp(ipv4Udp(dnsQuery("example.com")))!!
        val response = DnsPacket.wrapResponse(query, query.payload)

        assertArrayEquals(dnsIp, response.copyOfRange(12, 16))
        assertArrayEquals(clientIp, response.copyOfRange(16, 20))
        assertEquals(0, DnsPacket.checksum(response, 0, 20)) // valid header sums to zero
    }

    @Test
    fun blocklistMatchesParentDomainsButNotTlds() {
        val list = setOf("doubleclick.net", "net")
        assertEquals("doubleclick.net", Blocklist.match("stats.g.doubleclick.net", list))
        assertNull(Blocklist.match("net", list))
        assertNull(Blocklist.match("example.com", list))
    }
}
