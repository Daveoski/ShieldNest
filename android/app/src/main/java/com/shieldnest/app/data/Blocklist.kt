package com.shieldnest.app.data

import android.content.Context
import java.io.File
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/** The merged ad, tracker, malware and phishing domain list served by the ShieldNest API. */
object Blocklist {

    private const val SOURCE_URL =
        "https://shieldnest-delta.vercel.app/api/py/blocklist?category=all&format=txt"
    private const val MAX_AGE_MS = 24 * 60 * 60 * 1000L
    private const val FILE_NAME = "blocklist.txt"

    @Volatile
    private var domains: Set<String> = emptySet()

    /**
     * Loads the cached list, downloading a fresh copy first if it is missing or older than a day.
     * Falls back to the cached copy when the download fails.
     */
    fun load(context: Context) {
        val file = File(context.filesDir, FILE_NAME)
        val stale = !file.exists() || System.currentTimeMillis() - file.lastModified() > MAX_AGE_MS
        var error: String? = null

        if (stale) {
            try {
                download(file)
            } catch (e: IOException) {
                error = if (file.exists()) {
                    "Couldn't update the blocklist, so the saved copy is in use."
                } else {
                    "Couldn't download the blocklist. Only Cloudflare malware filtering is active."
                }
            }
        }

        domains = if (file.exists()) {
            file.useLines { lines ->
                lines.map { it.trim().lowercase() }.filter { it.isNotEmpty() }.toHashSet()
            }
        } else {
            emptySet()
        }

        ShieldState.update {
            it.copy(
                listSize = domains.size,
                listUpdatedAt = if (file.exists()) file.lastModified() else 0L,
                error = error,
            )
        }
    }

    /** Returns the listed entry that blocks this domain, or null if it is allowed. */
    fun match(domain: String): String? = match(domain, domains)

    internal fun match(domain: String, blocklist: Set<String>): String? {
        val labels = domain.lowercase().trimEnd('.').split('.')
        // Check the domain and each parent, but never a bare TLD
        for (i in 0 until labels.size - 1) {
            val candidate = labels.subList(i, labels.size).joinToString(".")
            if (candidate in blocklist) return candidate
        }
        return null
    }

    private fun download(target: File) {
        val connection = URL(SOURCE_URL).openConnection() as HttpURLConnection
        connection.connectTimeout = 15_000
        connection.readTimeout = 30_000
        try {
            if (connection.responseCode != HttpURLConnection.HTTP_OK) {
                throw IOException("HTTP ${connection.responseCode}")
            }
            val temp = File(target.parentFile, "$FILE_NAME.tmp")
            connection.inputStream.use { input -> temp.outputStream().use { input.copyTo(it) } }
            if (!temp.renameTo(target)) {
                temp.copyTo(target, overwrite = true)
                temp.delete()
            }
        } finally {
            connection.disconnect()
        }
    }
}
