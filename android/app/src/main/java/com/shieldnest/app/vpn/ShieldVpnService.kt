package com.shieldnest.app.vpn

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.content.pm.ServiceInfo
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.shieldnest.app.MainActivity
import com.shieldnest.app.R
import com.shieldnest.app.data.Blocklist
import com.shieldnest.app.data.ShieldState
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.concurrent.thread

/**
 * DNS-only VPN: the tunnel routes nothing but a fake DNS server address, so the
 * system sends every DNS lookup here. Blocked names get NXDOMAIN; the rest are
 * forwarded to Cloudflare's malware-blocking resolver. Other traffic never enters the tunnel.
 */
class ShieldVpnService : VpnService() {

    companion object {
        const val ACTION_STOP = "com.shieldnest.app.STOP"

        private const val VPN_ADDRESS = "10.111.222.1"
        private const val DNS_ADDRESS = "10.111.222.2"
        // Cloudflare 1.1.1.2 also blocks malware at the resolver: a second layer of protection
        private const val UPSTREAM_DNS = "1.1.1.2"
        private const val UPSTREAM_TIMEOUT_MS = 5_000
        private const val CHANNEL_ID = "protection"
        private const val NOTIFICATION_ID = 1
    }

    private var tunnel: ParcelFileDescriptor? = null
    private var worker: Thread? = null
    private val forwarders: ExecutorService = Executors.newFixedThreadPool(8)

    @Volatile
    private var running = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_STOP) {
            stopVpn()
            return START_NOT_STICKY
        }
        if (running) return START_STICKY

        startForegroundNotification()
        running = true
        ShieldState.update { it.copy(starting = true, error = null) }
        worker = thread(name = "shieldnest-vpn") { runVpn() }
        return START_STICKY
    }

    override fun onRevoke() {
        // Another VPN was turned on, or the user revoked access in Settings
        stopVpn()
    }

    override fun onDestroy() {
        stopVpn()
        forwarders.shutdownNow()
        super.onDestroy()
    }

    private fun runVpn() {
        try {
            Blocklist.load(this)

            val iface = Builder()
                .setSession(getString(R.string.app_name))
                .addAddress(VPN_ADDRESS, 32)
                .addDnsServer(DNS_ADDRESS)
                .addRoute(DNS_ADDRESS, 32)
                .setMtu(1500)
                .setBlocking(true)
                .establish()
                ?: throw IOException("VPN permission was not granted")
            tunnel = iface
            ShieldState.update { it.copy(running = true, starting = false) }

            val input = FileInputStream(iface.fileDescriptor)
            val output = FileOutputStream(iface.fileDescriptor)
            val buffer = ByteArray(Short.MAX_VALUE.toInt())
            while (running) {
                val length = input.read(buffer)
                if (length > 0) handlePacket(buffer.copyOf(length), output)
            }
        } catch (e: IOException) {
            // Closing the tunnel in stopVpn() also lands here; only report unexpected failures
            if (running) {
                ShieldState.update { it.copy(error = "Protection stopped: ${e.message}") }
            }
        } finally {
            // A quick off/on can start a new worker before this one exits; don't stop that one
            if (worker === Thread.currentThread()) stopVpn()
        }
    }

    private fun handlePacket(packet: ByteArray, output: FileOutputStream) {
        val query = DnsPacket.parseUdp(packet) ?: return
        val question = DnsPacket.parseQuestion(query.payload)

        if (question != null && Blocklist.match(question.name) != null) {
            write(output, DnsPacket.wrapResponse(query, DnsPacket.nxdomain(query.payload, question)))
            ShieldState.recordBlocked(question.name)
            return
        }

        forwarders.execute { forward(query, output) }
    }

    private fun forward(query: DnsPacket.UdpQuery, output: FileOutputStream) {
        try {
            DatagramSocket().use { socket ->
                // Keep our own upstream traffic out of the tunnel
                protect(socket)
                socket.soTimeout = UPSTREAM_TIMEOUT_MS
                val upstream = InetAddress.getByName(UPSTREAM_DNS)
                socket.send(DatagramPacket(query.payload, query.payload.size, upstream, 53))

                val reply = ByteArray(4096)
                val packet = DatagramPacket(reply, reply.size)
                socket.receive(packet)
                write(output, DnsPacket.wrapResponse(query, reply.copyOf(packet.length)))
            }
        } catch (_: IOException) {
            // Timeout or network change: the app's resolver will retry
        }
    }

    private fun write(output: FileOutputStream, packet: ByteArray) {
        if (!running) return
        try {
            synchronized(output) { output.write(packet) }
        } catch (_: IOException) {
            // Tunnel closed while a reply was in flight
        }
    }

    @Synchronized
    private fun stopVpn() {
        running = false
        tunnel?.close()
        tunnel = null
        ShieldState.update { it.copy(running = false, starting = false) }
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun startForegroundNotification() {
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ID,
                getString(R.string.notification_channel),
                NotificationManager.IMPORTANCE_LOW,
            )
        )

        val openApp = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE,
        )
        val stop = PendingIntent.getService(
            this, 1, Intent(this, ShieldVpnService::class.java).setAction(ACTION_STOP),
            PendingIntent.FLAG_IMMUTABLE,
        )
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_shield)
            .setContentTitle(getString(R.string.notification_title))
            .setContentText(getString(R.string.notification_text))
            .setContentIntent(openApp)
            .addAction(0, getString(R.string.action_turn_off), stop)
            .setOngoing(true)
            .build()

        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        } else {
            0
        }
        ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, type)
    }
}
