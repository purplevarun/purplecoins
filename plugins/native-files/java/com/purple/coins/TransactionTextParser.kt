package com.purple.coins.experimental

import java.util.Locale
import java.util.regex.Pattern

data class ParsedTransaction(
	val type: String,
	val amount: String,
	val merchant: String?,
	val referenceId: String?,
)

/**
 * Pure text parsing shared by every detection channel (UPI/bank app
 * notifications, Gmail grouped notifications, SMS alerts). Kept free of
 * Android framework side effects so it can be reused from both a
 * NotificationListenerService and a BroadcastReceiver without duplicating
 * the regexes.
 */
object TransactionTextParser {
	private val AMOUNT_PATTERN: Pattern =
		Pattern.compile(
			"(?:rs\\.?|inr|\\u20B9)\\s*([0-9][0-9,]*(?:\\.[0-9]{1,2})?)",
			Pattern.CASE_INSENSITIVE,
		)

	private val MERCHANT_PATTERN: Pattern =
		Pattern.compile(
			"(?:at|to|from)\\s+([A-Za-z0-9&.\\-' ]{2,40})",
			Pattern.CASE_INSENSITIVE,
		)

	private val REFERENCE_PATTERN: Pattern =
		Pattern.compile(
			"(?:utr|txn\\s*id|txn\\s*no\\.?|ref(?:erence)?\\.?\\s*no\\.?)[.:#\\s]*([A-Za-z0-9]{6,25})",
			Pattern.CASE_INSENSITIVE,
		)

	private val MERCHANT_DENYLIST =
		listOf("vpa", "upi", "a/c", "ac", "acct", "account", "your", "the")

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

	// Packages/senders trusted enough to skip the UPI/card keyword requirement below.
	private val HIGH_SIGNAL_PACKAGES =
		listOf(
			"phonepe",
			"paytm",
			"google.android.apps.nbu.paisa.user",
			"bhim",
			"mobikwik",
			"amazon",
			"google.android.gm",
		)

	/**
	 * Runs the full detection pipeline against a notification/SMS body.
	 * [isTrustedSource] lets callers bypass the UPI/card keyword requirement
	 * for sources they already trust (known payment app packages, Gmail,
	 * DLT-registered SMS sender headers) so plain bank alerts without those
	 * keywords still get picked up.
	 */
	fun parse(
		rawText: String,
		isTrustedSource: Boolean,
	): ParsedTransaction? {
		if (rawText.isBlank()) {
			return null
		}

		val normalized = rawText.lowercase(Locale.ENGLISH)
		if (IGNORE_KEYWORDS.any { normalized.contains(it) }) {
			return null
		}

		val amount = extractAmount(rawText) ?: return null
		val type = detectTransactionType(normalized) ?: return null

		val hasKeywordSignal = UPI_OR_CARD_KEYWORDS.any { normalized.contains(it) }
		if (!isTrustedSource && !hasKeywordSignal) {
			return null
		}

		return ParsedTransaction(
			type = type,
			amount = amount,
			merchant = extractMerchant(rawText),
			referenceId = extractReferenceId(rawText),
		)
	}

	fun isHighSignalPackage(packageName: String): Boolean {
		val normalized = packageName.lowercase(Locale.ENGLISH)
		return HIGH_SIGNAL_PACKAGES.any { normalized.contains(it) }
	}

	private fun extractAmount(text: String): String? {
		val matcher = AMOUNT_PATTERN.matcher(text)
		if (!matcher.find()) {
			return null
		}
		val raw = matcher.group(1) ?: return null
		return raw.replace(",", "")
	}

	private fun detectTransactionType(normalizedText: String): String? {
		val isDebit = DEBIT_KEYWORDS.any { normalizedText.contains(it) }
		val isCredit = CREDIT_KEYWORDS.any { normalizedText.contains(it) }

		if (isDebit && !isCredit) {
			return "Debit"
		}
		if (isCredit && !isDebit) {
			return "Credit"
		}
		return null
	}

	private fun extractMerchant(text: String): String? {
		val matcher = MERCHANT_PATTERN.matcher(text)
		if (!matcher.find()) {
			return null
		}
		val raw = matcher.group(1)?.trim(' ', '.', '-', '\'') ?: return null
		if (raw.length < 2 || MERCHANT_DENYLIST.contains(raw.lowercase(Locale.ENGLISH))) {
			return null
		}
		return raw
	}

	private fun extractReferenceId(text: String): String? {
		val matcher = REFERENCE_PATTERN.matcher(text)
		if (!matcher.find()) {
			return null
		}
		return matcher.group(1)
	}
}
