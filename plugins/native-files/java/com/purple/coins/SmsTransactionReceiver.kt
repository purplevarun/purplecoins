package com.purple.coins

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import java.util.regex.Pattern

/**
 * Detects transaction-style SMS alerts (bank/card debit-credit messages).
 * Reuses [TransactionTextParser] + [TransactionDetectionNotifier] so SMS and
 * app-notification detection behave identically once text is extracted.
 */
class SmsTransactionReceiver : BroadcastReceiver() {
	companion object {
		// DLT-registered sender headers look like "AX-HDFCBK", never a phone number.
		private val SENDER_HEADER_PATTERN: Pattern =
			Pattern.compile("^[A-Za-z]{2}-[A-Za-z0-9]{3,}$")
	}

	override fun onReceive(
		context: Context,
		intent: Intent,
	) {
		if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
			return
		}
		if (!TransactionDetectionNotifier.isDetectionEnabled(context)) {
			return
		}

		val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
		if (messages.isNullOrEmpty()) {
			return
		}

		val sender =
			messages[0].displayOriginatingAddress
				?: messages[0].originatingAddress
				?: return
		val body = messages.joinToString("") { it.messageBody ?: "" }
		if (body.isBlank()) {
			return
		}

		val isTrustedSender = SENDER_HEADER_PATTERN.matcher(sender).matches()
		val parsed = TransactionTextParser.parse(body, isTrustedSender) ?: return

		TransactionDetectionNotifier.notifyIfNotDuplicate(
			context,
			TransactionDetectionNotifier.CHANNEL_SMS,
			sender,
			parsed,
		)
	}
}
