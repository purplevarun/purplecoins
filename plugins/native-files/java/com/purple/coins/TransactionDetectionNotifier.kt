package com.purple.coins.experimental

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import java.util.Locale

/**
 * Shared "add this transaction?" notification + de-dupe logic used by both
 * [UpiNotificationListenerService] (app notifications) and
 * `SmsTransactionReceiver` (SMS_RECEIVED broadcasts), so the two detection
 * channels behave identically once [TransactionTextParser] has produced a
 * [ParsedTransaction]. Also used by `MainActivity`/`UpiNotificationDetectorModule`
 * for the shared intent-extra/Bundle key names.
 */
object TransactionDetectionNotifier {
	private const val PREFERENCES_NAME = "purplecoins_upi_detection"
	private const val ENABLED_KEY = "enabled"
	private const val LAST_HASH_KEY = "last_hash"
	private const val LAST_HASH_AT_KEY = "last_hash_at"

	private const val CHANNEL_ID = "detected-transactions"
	private const val ADD_REQUEST_NOTIFICATION_ID = 9100
	private const val DUPLICATE_WINDOW_MS = 90_000L

	const val CHANNEL_NOTIFICATION = "NOTIFICATION"
	const val CHANNEL_SMS = "SMS"

	const val TYPE_KEY = "purplecoins_detected_transaction_type"
	const val AMOUNT_KEY = "purplecoins_detected_transaction_amount"
	const val SOURCE_KEY = "purplecoins_detected_transaction_source"
	const val DETECTED_AT_KEY = "purplecoins_detected_transaction_at"
	const val MERCHANT_KEY = "purplecoins_detected_transaction_merchant"
	const val REFERENCE_KEY = "purplecoins_detected_transaction_reference"
	const val CHANNEL_KEY = "purplecoins_detected_transaction_channel"

	fun isDetectionEnabled(context: Context): Boolean =
		getPreferences(context).getBoolean(ENABLED_KEY, true)

	fun setDetectionEnabled(
		context: Context,
		enabled: Boolean,
	) {
		getPreferences(context).edit().putBoolean(ENABLED_KEY, enabled).apply()
	}

	/**
	 * Posts the "add this transaction?" notification unless an equivalent
	 * type+amount combination was already notified within the last 90s,
	 * regardless of which channel detected it — banks often send both a push
	 * notification and an SMS for the same transaction.
	 */
	fun notifyIfNotDuplicate(
		context: Context,
		channel: String,
		source: String,
		parsed: ParsedTransaction,
	) {
		val dedupeHash = "${parsed.type}|${parsed.amount}"
		if (isDuplicate(context, dedupeHash)) {
			return
		}
		notifyDetectedTransaction(context, channel, source, parsed)
	}

	private fun getPreferences(context: Context) =
		context.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

	private fun isDuplicate(
		context: Context,
		hash: String,
	): Boolean {
		val preferences = getPreferences(context)
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

	private fun notifyDetectedTransaction(
		context: Context,
		channel: String,
		source: String,
		parsed: ParsedTransaction,
	) {
		ensureNotificationChannel(context)

		val openAppIntent =
			Intent(context, MainActivity::class.java).apply {
				addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
				putExtra(TYPE_KEY, parsed.type)
				putExtra(AMOUNT_KEY, parsed.amount)
				putExtra(SOURCE_KEY, source)
				putExtra(DETECTED_AT_KEY, System.currentTimeMillis())
				putExtra(MERCHANT_KEY, parsed.merchant)
				putExtra(REFERENCE_KEY, parsed.referenceId)
				putExtra(CHANNEL_KEY, channel)
			}

		val contentIntent =
			PendingIntent.getActivity(
				context,
				ADD_REQUEST_NOTIFICATION_ID,
				openAppIntent,
				PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
			)

		val readableSource = getReadableSource(channel, source)
		val notification =
			NotificationCompat
				.Builder(context, CHANNEL_ID)
				.setSmallIcon(R.mipmap.ic_launcher)
				.setContentTitle("Add this transaction?")
				.setContentText("${parsed.type} Rs ${parsed.amount} detected from $readableSource")
				.setStyle(
					NotificationCompat.BigTextStyle().bigText(
						"${parsed.type} Rs ${parsed.amount} detected from $readableSource. Tap to add it in PurpleCoins.",
					),
				).setPriority(NotificationCompat.PRIORITY_HIGH)
				.setAutoCancel(true)
				.setContentIntent(contentIntent)
				.build()

		val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
		manager.notify((System.currentTimeMillis() % Int.MAX_VALUE).toInt(), notification)
	}

	private fun getReadableSource(
		channel: String,
		source: String,
	): String {
		if (channel == CHANNEL_SMS) {
			return "SMS ($source)"
		}
		val packageName = source.lowercase(Locale.ENGLISH)
		if (packageName.contains("phonepe")) return "PhonePe"
		if (packageName.contains("paytm")) return "Paytm"
		if (packageName.contains("google.android.apps.nbu.paisa.user")) return "Google Pay"
		if (packageName.contains("bhim")) return "BHIM"
		if (packageName.contains("google.android.gm")) return "Gmail"
		return packageName.substringAfterLast('.')
	}

	private fun ensureNotificationChannel(context: Context) {
		if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
			return
		}

		val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
		val existing = manager.getNotificationChannel(CHANNEL_ID)
		if (existing != null) {
			return
		}

		val newChannel =
			NotificationChannel(
				CHANNEL_ID,
				"Detected transactions",
				NotificationManager.IMPORTANCE_HIGH,
			)
		newChannel.description = "Prompts to add UPI/card/SMS transaction activity to PurpleCoins"
		newChannel.enableVibration(true)
		newChannel.vibrationPattern = longArrayOf(0, 220, 180, 220)
		manager.createNotificationChannel(newChannel)
	}
}
