package com.purple.coins.experimental

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class UpiNotificationDetectorModule(
	reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
	override fun getName(): String = "UpiNotificationDetector"

	@ReactMethod
	fun getDetectionEnabled(promise: Promise) {
		promise.resolve(TransactionDetectionNotifier.isDetectionEnabled(reactApplicationContext))
	}

	@ReactMethod
	fun setDetectionEnabled(enabled: Boolean) {
		TransactionDetectionNotifier.setDetectionEnabled(reactApplicationContext, enabled)
	}

	@ReactMethod
	fun isNotificationAccessEnabled(promise: Promise) {
		val packageName = reactApplicationContext.packageName
		val flat =
			Settings.Secure.getString(
				reactApplicationContext.contentResolver,
				"enabled_notification_listeners",
			)

		if (flat.isNullOrBlank()) {
			promise.resolve(false)
			return
		}

		val serviceName =
			ComponentName(
				reactApplicationContext,
				UpiNotificationListenerService::class.java,
			)

		val enabled =
			flat
				.split(":")
				.mapNotNull { ComponentName.unflattenFromString(it) }
				.any { component ->
					component.packageName == packageName &&
						component.className == serviceName.className
				}

		promise.resolve(enabled)
	}

	@ReactMethod
	fun openNotificationAccessSettings() {
		val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
		intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
		reactApplicationContext.startActivity(intent)
	}

	@ReactMethod
	fun consumeDetectedTransaction(promise: Promise) {
		val payload = MainActivity.consumePendingDetectedTransaction()
		if (payload == null) {
			promise.resolve(null)
			return
		}

		val result = Arguments.createMap()
		result.putString("type", payload.getString(TransactionDetectionNotifier.TYPE_KEY))
		result.putString("amount", payload.getString(TransactionDetectionNotifier.AMOUNT_KEY))
		result.putString("source", payload.getString(TransactionDetectionNotifier.SOURCE_KEY))
		result.putDouble(
			"detectedAt",
			payload
				.getLong(TransactionDetectionNotifier.DETECTED_AT_KEY, System.currentTimeMillis())
				.toDouble(),
		)
		result.putString("merchant", payload.getString(TransactionDetectionNotifier.MERCHANT_KEY))
		result.putString("referenceId", payload.getString(TransactionDetectionNotifier.REFERENCE_KEY))
		result.putString(
			"channel",
			payload.getString(TransactionDetectionNotifier.CHANNEL_KEY)
				?: TransactionDetectionNotifier.CHANNEL_NOTIFICATION,
		)
		promise.resolve(result)
	}
}
