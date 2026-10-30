package com.shieldnest.app.ui

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.shieldnest.app.R
import com.shieldnest.app.data.ShieldState
import java.text.NumberFormat

@Composable
fun HomeScreen(onToggle: () -> Unit) {
    val status by ShieldState.status.collectAsStateWithLifecycle()
    val colors = MaterialTheme.colorScheme
    val numbers = NumberFormat.getIntegerInstance()

    val ringColor by animateColorAsState(
        if (status.running) colors.primary else colors.surfaceVariant,
        label = "ring",
    )
    val iconColor by animateColorAsState(
        if (status.running) colors.onPrimary else colors.onSurfaceVariant,
        label = "icon",
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
            .safeDrawingPadding()
            .padding(horizontal = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "ShieldNest",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(top = 16.dp),
        )

        Spacer(Modifier.height(40.dp))

        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(180.dp)
                .clip(CircleShape)
                .background(ringColor)
                .clickable(enabled = !status.starting, onClick = onToggle),
        ) {
            if (status.starting) {
                CircularProgressIndicator(color = colors.primary)
            } else {
                Icon(
                    painter = painterResource(R.drawable.ic_shield),
                    contentDescription = if (status.running) "Turn protection off" else "Turn protection on",
                    tint = iconColor,
                    modifier = Modifier.size(84.dp),
                )
            }
        }

        Spacer(Modifier.height(20.dp))
        Text(
            text = when {
                status.starting -> "Turning on…"
                status.running -> "You're protected"
                else -> "Protection is off"
            },
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.SemiBold,
        )
        Text(
            text = if (status.running) "Tap the shield to turn off" else "Tap the shield to turn on",
            color = colors.onSurfaceVariant,
            style = MaterialTheme.typography.bodyMedium,
        )

        status.error?.let {
            Spacer(Modifier.height(12.dp))
            Text(text = it, color = colors.error, style = MaterialTheme.typography.bodySmall)
        }

        Spacer(Modifier.height(28.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            StatCard("Blocked", numbers.format(status.blockedCount), Modifier.weight(1f))
            StatCard("Domains on list", numbers.format(status.listSize), Modifier.weight(1f))
        }

        Spacer(Modifier.height(24.dp))
        Text(
            text = "Recently blocked",
            style = MaterialTheme.typography.titleSmall,
            color = colors.onSurfaceVariant,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.height(8.dp))
        LazyColumn(modifier = Modifier.weight(1f).fillMaxWidth()) {
            if (status.recentBlocked.isEmpty()) {
                item {
                    Text(
                        text = "Nothing blocked yet.",
                        color = colors.onSurfaceVariant,
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
            items(status.recentBlocked) { domain ->
                Text(
                    text = domain,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(vertical = 6.dp),
                )
            }
        }

        Text(
            text = "If ads still appear, set Private DNS to Off or Automatic in Settings › Network.",
            color = colors.onSurfaceVariant,
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.padding(vertical = 16.dp),
        )
    }
}

@Composable
private fun StatCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(
                value,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.primary,
            )
        }
    }
}
