package com.purple.coins.experimental

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import androidx.core.app.NotificationCompat
import java.util.Locale
import java.util.regex.Pattern

class UpiNotificationListenerService : NotificationListenerService() {
    companion object {
        private const val PREFERENCES_NAME = "purplecoins_upi_detection"
        private const val ENABLED_KEY = "enabled"
        private const val LAST_HASH_KEY = "last_hash"
        private const val LAST_HASH_AT_KEY = "last_hash_at"

        private const val CHANNEL_ID = "detected-transactions"
        private const val ADD_REQUEST_NOTIFICATION_ID = 9100
        private const val DUPLICATE_WINDOW_MS = 90_000L

        private val AMOUNT_PATTERN: Pattern =
            Pattern.compile(
                "(?:rs\\.?|inr|\\u20B9)\\s*([0-9][0-9,]*(?:\\.[0-9]{1,2})?)",
                Pattern.CASE_INSENSITIVE,
            )

        private val UPI_OR_CARD_KEYWORDS =
            listOf(
                "upi",
                "utr",
                "vpa",
                "phonepe",
                "paytm",
                "gpay",
                "google pay",
                "bhim",
                "amazon pay",
                "mobikwik",
                "debit card",
                "credit card",
                "pos",
                "spent",
            )

        private val DEBIT_KEYWORDS =
            listOf(
                "debited",
                "debit",
                "paid",
                "spent",
                "sent",
                "withdrawn",
                "dr",
            )

        private val CREDIT_KEYWORDS =
            listOf(
                "credited",
                "credit",
                "received",
                "deposited",
                "refunded",
                "cr",
            )

        private val IGNORE_KEYWORDS =
            listOf(
                "otp",
                "failed",
                "declined",
                "pending",
                "offer",
                "promo",
            )

        private val HIGH_SIGNAL_PACKAGES =
            listOf(
                "phonepe",
                "paytm",
                "google.android.apps.nbu.paisa.user",
                "bhim",
                "mobikwik",
                "amazon",
            )
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null || !isDetectionEnabled()) {
            return
        }

        val text = buildNotificationText(sbn.notification)
        if (text.isBlank()) {
            return
        }

        val normalized = text.lowercase(Locale.ENGLISH)
        if (IGNORE_KEYWORDS.any { normalized.contains(it) }) {
            return
        }

        val amount = extractAmount(text) ?: return
        val type = detectTransactionType(normalized) ?: return

        val packageName = sbn.packageName.lowercase(Locale.ENGLISH)
        val hasSourceSignal =
            HIGH_SIGNAL_PACKAGES.any { packageName.contains(it) } ||
                UPI_OR_CARD_KEYWORDS.any { normalized.contains(it) }
        if (!hasSourceSignal) {
            return
        }

        val dedupeHash = "$packageName|$type|$amount"
        if (isDuplicate(dedupeHash)) {
            return
        }

        postAddTransactionPrompt(type, amount, packageName)
    }

    private fun isDetectionEnabled(): Boolean = getPreferences().getBoolean(ENABLED_KEY, true)

    private fun getPreferences() = getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

    private fun buildNotificationText(notification: Notification): String {
        val extras = notification.extras
        val parts =
            listOfNotNull(
                extras.getCharSequence(Notification.EXTRA_TITLE)?.toString(),
                extras.getCharSequence(Notification.EXTRA_TEXT)?.toString(),
                extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString(),
                extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString(),
            )
        return parts.joinToString(" ").trim()
    }

    private fun extractAmount(message: String): String? {
        val matcher = AMOUNT_PATTERN.matcher(message)
        if (!matcher.find()) {
            return null
        }
        val raw = matcher.group(1) ?: return null
        return raw.replace(",", "")
    }

    private fun detectTransactionType(normalizedMessage: String): String? {
        val isDebit = DEBIT_KEYWORDS.any { normalizedMessage.contains(it) }
        val isCredit = CREDIT_KEYWORDS.any { normalizedMessage.contains(it) }

        if (isDebit && !isCredit) {
            return "Debit"
        }
        if (isCredit && !isDebit) {
            return "Credit"
        }
        return null
    }

    private fun isDuplicate(hash: String): Boolean {
        val preferences = getPreferences()
        val now = System.currentTimeMillis()
        val previousHash = preferences.getString(LAST_HASH_KEY, null)
        val previousAt = preferences.getLong(LAST_HASH_AT_KEY, 0L)

        if (hash == previousHash && now - previousAt < DUPLICATE_WINDOW_MS) {
            return true
        }

        preferences
            .edit()
            .putString(LAST_HASH_KEY, hash)
            .putLong(LAST_HASH_AT_KEY, now)
            .apply()

        return false
    }

    private fun postAddTransactionPrompt(
        type: String,
        amount: String,
        packageName: String,
    ) {
        ensureNotificationChannel()

        val openAppIntent =
            Intent(this, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                putExtra("purplecoins_detected_transaction_type", type)
                putExtra("purplecoins_detected_transaction_amount", amount)
                putExtra("purplecoins_detected_transaction_source", packageName)
                putExtra("purplecoins_detected_transaction_at", System.currentTimeMillis())
            }

        val contentIntent =
            PendingIntent.getActivity(
                this,
                ADD_REQUEST_NOTIFICATION_ID,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )

        val notification =
            NotificationCompat
                .Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("Add this transaction?")
                .setContentText("$type Rs $amount detected from ${getReadableSource(packageName)}")
                .setStyle(
                    NotificationCompat.BigTextStyle().bigText(
                        "$type Rs $amount detected from ${getReadableSource(packageName)}. Tap to add it in PurpleCoins.",
                    ),
                ).setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(contentIntent)
                .build()

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify((System.currentTimeMillis() % Int.MAX_VALUE).toInt(), notification)
    }

    private fun getReadableSource(packageName: String): String {
        if (packageName.contains("phonepe")) return "PhonePe"
        if (packageName.contains("paytm")) return "Paytm"
        if (packageName.contains("google.android.apps.nbu.paisa.user")) return "Google Pay"
        if (packageName.contains("bhim")) return "BHIM"
        return packageName.substringAfterLast('.')
    }

    private fun ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val existing = manager.getNotificationChannel(CHANNEL_ID)
        if (existing != null) {
            return
        }

        val channel =
            NotificationChannel(
                CHANNEL_ID,
                "Detected transactions",
                NotificationManager.IMPORTANCE_HIGH,
            )
        channel.description = "Prompts to add UPI/card transaction activity to PurpleCoins"
        channel.enableVibration(true)
        channel.vibrationPattern = longArrayOf(0, 220, 180, 220)
        manager.createNotificationChannel(channel)
    }
}
