package com.shieldnest.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.shieldnest.app.data.ShieldState
import com.shieldnest.app.ui.HomeScreen
import com.shieldnest.app.ui.ShieldNestTheme
import com.shieldnest.app.vpn.ShieldVpnService

class MainActivity : ComponentActivity() {

    private val vpnPermission =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == RESULT_OK) startShield()
        }

    private val notificationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ShieldNestTheme {
                HomeScreen(onToggle = ::toggleProtection)
            }
        }
    }

    private fun toggleProtection() {
        val status = ShieldState.status.value
        if (status.running || status.starting) {
            startService(Intent(this, ShieldVpnService::class.java).setAction(ShieldVpnService.ACTION_STOP))
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }

        // Android shows its own "connection request" dialog the first time
        val consent = VpnService.prepare(this)
        if (consent != null) vpnPermission.launch(consent) else startShield()
    }

    private fun startShield() {
        ContextCompat.startForegroundService(this, Intent(this, ShieldVpnService::class.java))
    }
}
