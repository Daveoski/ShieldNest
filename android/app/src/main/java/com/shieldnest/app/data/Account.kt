package com.shieldnest.app.data

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/**
 * Optional ShieldNest account sign-in, using the website's device flow:
 * the app shows a code, the user approves it at /device, and the app receives a session token.
 * Protection works the same whether or not the user is signed in.
 */
object Account {

    data class User(val name: String, val email: String)

    class DeviceCode(val deviceCode: String, val userCode: String, val verificationUrl: String, val intervalSeconds: Int) {
        /** Shown as ABCD-1234 to match the website. */
        val displayCode: String
            get() = if (userCode.length == 8) "${userCode.take(4)}-${userCode.drop(4)}" else userCode
    }

    sealed interface PollResult {
        data class SignedIn(val user: User) : PollResult
        data object Denied : PollResult
        data object Expired : PollResult
    }

    private const val BASE_URL = "https://shieldnest-delta.vercel.app/api/auth"
    private const val CLIENT_ID = "shieldnest-android"
    private const val PREFS = "account"

    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user.asStateFlow()

    fun restore(context: Context) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val email = prefs.getString("email", null) ?: return
        _user.value = User(prefs.getString("name", "") ?: "", email)
    }

    suspend fun requestCode(): DeviceCode = withContext(Dispatchers.IO) {
        val json = post("/device/code", JSONObject().put("client_id", CLIENT_ID)).second
        DeviceCode(
            deviceCode = json.getString("device_code"),
            userCode = json.getString("user_code"),
            verificationUrl = json.getString("verification_uri_complete"),
            intervalSeconds = json.optInt("interval", 5),
        )
    }

    /** Polls until the user approves or denies on the website, or the code expires. */
    suspend fun awaitApproval(context: Context, code: DeviceCode): PollResult = withContext(Dispatchers.IO) {
        var interval = code.intervalSeconds
        while (true) {
            delay(interval * 1000L)
            val body = JSONObject()
                .put("grant_type", "urn:ietf:params:oauth:grant-type:device_code")
                .put("device_code", code.deviceCode)
                .put("client_id", CLIENT_ID)
            val (status, json) = try {
                post("/device/token", body)
            } catch (_: IOException) {
                continue // brief network drop: keep waiting
            }
            if (status == 200) {
                val token = json.getString("access_token")
                val user = fetchUser(token)
                context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                    .putString("token", token)
                    .putString("name", user.name)
                    .putString("email", user.email)
                    .apply()
                _user.value = user
                return@withContext PollResult.SignedIn(user)
            }
            when (json.optString("error")) {
                "authorization_pending" -> Unit
                "slow_down" -> interval += 5
                "access_denied" -> return@withContext PollResult.Denied
                else -> return@withContext PollResult.Expired
            }
        }
        @Suppress("UNREACHABLE_CODE")
        PollResult.Expired
    }

    suspend fun signOut(context: Context) = withContext(Dispatchers.IO) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        prefs.getString("token", null)?.let { token ->
            try {
                post("/sign-out", JSONObject(), token)
            } catch (_: IOException) {
                // Offline: the token still expires on the server by itself
            }
        }
        prefs.edit().clear().apply()
        _user.value = null
    }

    private fun fetchUser(token: String): User {
        val connection = (URL("$BASE_URL/get-session").openConnection() as HttpURLConnection).apply {
            setRequestProperty("Authorization", "Bearer $token")
            connectTimeout = 15_000
            readTimeout = 15_000
        }
        try {
            val user = JSONObject(connection.inputStream.bufferedReader().readText()).getJSONObject("user")
            return User(user.optString("name"), user.getString("email"))
        } finally {
            connection.disconnect()
        }
    }

    private fun post(path: String, body: JSONObject, bearer: String? = null): Pair<Int, JSONObject> {
        val connection = (URL("$BASE_URL$path").openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            doOutput = true
            connectTimeout = 15_000
            readTimeout = 15_000
            setRequestProperty("Content-Type", "application/json")
            bearer?.let { setRequestProperty("Authorization", "Bearer $it") }
        }
        try {
            connection.outputStream.use { it.write(body.toString().toByteArray()) }
            val status = connection.responseCode
            val stream = if (status < 400) connection.inputStream else connection.errorStream
            val text = stream?.bufferedReader()?.readText().orEmpty()
            return status to (if (text.startsWith("{")) JSONObject(text) else JSONObject())
        } finally {
            connection.disconnect()
        }
    }
}
