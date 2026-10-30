package com.shieldnest.app.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/** Protection status shared between the VPN service and the UI. */
object ShieldState {

    data class Status(
        val running: Boolean = false,
        val starting: Boolean = false,
        val blockedCount: Int = 0,
        val recentBlocked: List<String> = emptyList(),
        val listSize: Int = 0,
        val listUpdatedAt: Long = 0L,
        val error: String? = null,
    )

    private const val RECENT_LIMIT = 50

    private val _status = MutableStateFlow(Status())
    val status: StateFlow<Status> = _status.asStateFlow()

    fun update(transform: (Status) -> Status) = _status.update(transform)

    fun recordBlocked(domain: String) = _status.update {
        it.copy(
            blockedCount = it.blockedCount + 1,
            recentBlocked = (listOf(domain) + it.recentBlocked).take(RECENT_LIMIT),
        )
    }
}
