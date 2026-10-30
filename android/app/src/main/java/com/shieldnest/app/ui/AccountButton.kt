package com.shieldnest.app.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.shieldnest.app.data.Account
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.io.IOException

private sealed interface SignInState {
    data object Requesting : SignInState
    data class Waiting(val code: Account.DeviceCode) : SignInState
    data class Failed(val message: String) : SignInState
}

/** "Sign in" when signed out; the user's name with a Sign out menu when signed in. */
@Composable
fun AccountButton() {
    val context = LocalContext.current
    val uriHandler = LocalUriHandler.current
    val scope = rememberCoroutineScope()
    val user by Account.user.collectAsStateWithLifecycle()
    var state by remember { mutableStateOf<SignInState?>(null) }
    var job by remember { mutableStateOf<Job?>(null) }
    var menuOpen by remember { mutableStateOf(false) }

    fun startSignIn() {
        state = SignInState.Requesting
        job = scope.launch {
            val code = try {
                Account.requestCode()
            } catch (e: IOException) {
                state = SignInState.Failed("Couldn't reach ShieldNest. Check your internet connection.")
                return@launch
            }
            state = SignInState.Waiting(code)
            uriHandler.openUri(code.verificationUrl)
            state = when (Account.awaitApproval(context, code)) {
                is Account.PollResult.SignedIn -> null
                Account.PollResult.Denied -> SignInState.Failed("Sign-in was denied on the website.")
                Account.PollResult.Expired -> SignInState.Failed("The code expired. Please try again.")
            }
        }
    }

    val signedIn = user
    if (signedIn == null) {
        TextButton(onClick = ::startSignIn) { Text("Sign in") }
    } else {
        TextButton(onClick = { menuOpen = true }) {
            Text(signedIn.name.ifBlank { signedIn.email }.split(" ").first(), maxLines = 1)
        }
        DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
            DropdownMenuItem(
                text = { Text(signedIn.email, style = MaterialTheme.typography.bodySmall) },
                onClick = {},
                enabled = false,
            )
            DropdownMenuItem(
                text = { Text("Sign out") },
                onClick = {
                    menuOpen = false
                    scope.launch { Account.signOut(context) }
                },
            )
        }
    }

    state?.let { current ->
        AlertDialog(
            onDismissRequest = {},
            title = { Text("Sign in to ShieldNest") },
            text = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    when (current) {
                        SignInState.Requesting -> CircularProgressIndicator()
                        is SignInState.Waiting -> {
                            Text("Approve this code in your browser. You can sign in with Google or email there.")
                            Spacer(Modifier.height(16.dp))
                            Text(
                                current.code.displayCode,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                fontSize = 28.sp,
                                color = MaterialTheme.colorScheme.primary,
                            )
                            Spacer(Modifier.height(16.dp))
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                                Text("Waiting for approval…", style = MaterialTheme.typography.bodySmall)
                            }
                        }
                        is SignInState.Failed -> Text(current.message, color = MaterialTheme.colorScheme.error)
                    }
                }
            },
            confirmButton = {
                when (current) {
                    is SignInState.Waiting -> Button(onClick = { uriHandler.openUri(current.code.verificationUrl) }) {
                        Text("Open browser")
                    }
                    is SignInState.Failed -> Button(onClick = ::startSignIn) { Text("Try again") }
                    SignInState.Requesting -> Unit
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        job?.cancel()
                        state = null
                    },
                    modifier = Modifier.padding(end = 4.dp),
                ) { Text("Cancel") }
            },
        )
    }
}
