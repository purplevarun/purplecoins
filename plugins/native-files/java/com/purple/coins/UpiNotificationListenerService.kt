package com.purple.coins.experimental

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

/**
 * Watches posted notifications for transaction-style alerts from UPI/bank
 * apps and Gmail (grouped bank-alert emails). Text extraction + validation
 * lives in [TransactionTextParser]; de-dupe + the "add this transaction?"
 * prompt live in [TransactionDetectionNotifier] so behavior matches the SMS
 * detection channel (`SmsTransactionReceiver`).
 */
class UpiNotificationListenerService : NotificationListenerService() {
	override fun onNotificationPosted(sbn: StatusBarNotification?) {
		if (sbn == null || !TransactionDetectionNotifier.isDetectionEnabled(this)) {
			return
		}

		val text = buildNotificationText(sbn.notification)
		if (text.isBlank()) {
			return
		}

		val isTrustedSource = TransactionTextParser.isHighSignalPackage(sbn.packageName)
		val parsed = TransactionTextParser.parse(text, isTrustedSource) ?: return

		TransactionDetectionNotifier.notifyIfNotDuplicate(
			this,
			TransactionDetectionNotifier.CHANNEL_NOTIFICATION,
			sbn.packageName,
			parsed,
		)
	}

	private fun buildNotificationText(notification: Notification): String {
		val extras = notification.extras
		// EXTRA_TEXT_LINES carries each item's text in Gmail's grouped/summary notifications.
		val textLines =
			extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES)?.map { it.toString() }
				?: emptyList()
		val parts =
			listOfNotNull(
				extras.getCharSequence(Notification.EXTRA_TITLE)?.toString(),
				extras.getCharSequence(Notification.EXTRA_TEXT)?.toString(),
				extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString(),
				extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString(),
			) + textLines
		return parts.joinToString(" ").trim()
	}
}
