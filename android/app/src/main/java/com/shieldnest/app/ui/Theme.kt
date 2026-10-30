package com.shieldnest.app.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Matches the website palette (src/app/globals.css)
private val ShieldNestColors = darkColorScheme(
    primary = Color(0xFF3DDBB8),
    onPrimary = Color(0xFF06302A),
    secondary = Color(0xFF7FA8F5),
    background = Color(0xFF0E1621),
    onBackground = Color(0xFFF2F5F8),
    surface = Color(0xFF151F2C),
    onSurface = Color(0xFFF2F5F8),
    surfaceVariant = Color(0xFF1C2837),
    onSurfaceVariant = Color(0xFFAAB6C4),
    error = Color(0xFFF2766B),
)

@Composable
fun ShieldNestTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = ShieldNestColors, content = content)
}
