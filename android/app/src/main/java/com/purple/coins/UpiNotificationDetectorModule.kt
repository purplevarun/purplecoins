package com.purple.coins.experimental

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class UpiNotificationDetectorModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val PREFERENCES_NAME = "purplecoins_upi_detection"
    private const val ENABLED_KEY = "enabled"
    private const val TYPE_KEY = "purplecoins_detected_transaction_type"
    private const val AMOUNT_KEY = "purplecoins_detected_transaction_amount"
    private const val SOURCE_KEY = "purplecoins_detected_transaction_source"
    private const val DETECTED_AT_KEY = "purplecoins_detected_transaction_at"
  }

  override fun getName(): String = "UpiNotificationDetector"

  private fun getPreferences() =
    reactApplicationContext.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

  @ReactMethod
  fun getDetectionEnabled(promise: Promise) {
    promise.resolve(getPreferences().getBoolean(ENABLED_KEY, true))
  }

  @ReactMethod
  fun setDetectionEnabled(enabled: Boolean) {
    getPreferences().edit().putBoolean(ENABLED_KEY, enabled).apply()
  }

  @ReactMethod
  fun isNotificationAccessEnabled(promise: Promise) {
    val packageName = reactApplicationContext.packageName
    val flat = Settings.Secure.getString(
      reactApplicationContext.contentResolver,
      "enabled_notification_listeners"
    )

    if (flat.isNullOrBlank()) {
      promise.resolve(false)
      return
    }

    val serviceName = ComponentName(
      reactApplicationContext,
      UpiNotificationListenerService::class.java
    )

    val enabled = flat.split(":")
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
    result.putString("type", payload.getString(TYPE_KEY))
    result.putString("amount", payload.getString(AMOUNT_KEY))
    result.putString("source", payload.getString(SOURCE_KEY))
    result.putDouble(
      "detectedAt",
      payload.getLong(DETECTED_AT_KEY, System.currentTimeMillis()).toDouble()
    )
    promise.resolve(result)
  }
}


