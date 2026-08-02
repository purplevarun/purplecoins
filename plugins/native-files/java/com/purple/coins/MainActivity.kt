package com.purple.coins.experimental

import android.os.Build
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
	companion object {
		@Volatile private var pendingDetectedTransaction: Bundle? = null

		fun consumePendingDetectedTransaction(): Bundle? {
			val snapshot = pendingDetectedTransaction
			pendingDetectedTransaction = null
			return snapshot
		}

		private fun captureDetectedTransactionFromIntent(intent: android.content.Intent?) {
			if (intent == null ||
				!intent.hasExtra(TransactionDetectionNotifier.TYPE_KEY) ||
				!intent.hasExtra(TransactionDetectionNotifier.AMOUNT_KEY)
			) {
				return
			}

			val payload =
				Bundle().apply {
					putString(
						TransactionDetectionNotifier.TYPE_KEY,
						intent.getStringExtra(TransactionDetectionNotifier.TYPE_KEY),
					)
					putString(
						TransactionDetectionNotifier.AMOUNT_KEY,
						intent.getStringExtra(TransactionDetectionNotifier.AMOUNT_KEY),
					)
					putString(
						TransactionDetectionNotifier.SOURCE_KEY,
						intent.getStringExtra(TransactionDetectionNotifier.SOURCE_KEY),
					)
					putLong(
						TransactionDetectionNotifier.DETECTED_AT_KEY,
						intent.getLongExtra(
							TransactionDetectionNotifier.DETECTED_AT_KEY,
							System.currentTimeMillis(),
						),
					)
					putString(
						TransactionDetectionNotifier.MERCHANT_KEY,
						intent.getStringExtra(TransactionDetectionNotifier.MERCHANT_KEY),
					)
					putString(
						TransactionDetectionNotifier.REFERENCE_KEY,
						intent.getStringExtra(TransactionDetectionNotifier.REFERENCE_KEY),
					)
					putString(
						TransactionDetectionNotifier.CHANNEL_KEY,
						intent.getStringExtra(TransactionDetectionNotifier.CHANNEL_KEY),
					)
				}

			pendingDetectedTransaction = payload
			intent.removeExtra(TransactionDetectionNotifier.TYPE_KEY)
			intent.removeExtra(TransactionDetectionNotifier.AMOUNT_KEY)
			intent.removeExtra(TransactionDetectionNotifier.SOURCE_KEY)
			intent.removeExtra(TransactionDetectionNotifier.DETECTED_AT_KEY)
			intent.removeExtra(TransactionDetectionNotifier.MERCHANT_KEY)
			intent.removeExtra(TransactionDetectionNotifier.REFERENCE_KEY)
			intent.removeExtra(TransactionDetectionNotifier.CHANNEL_KEY)
		}
	}

	override fun onCreate(savedInstanceState: Bundle?) {
		// Set the theme to AppTheme BEFORE onCreate to support
		// coloring the background, status bar, and navigation bar.
		// This is required for expo-splash-screen.
		setTheme(R.style.AppTheme)
		captureDetectedTransactionFromIntent(intent)
		super.onCreate(null)
	}

	override fun onNewIntent(intent: android.content.Intent?) {
		super.onNewIntent(intent)
		setIntent(intent)
		captureDetectedTransactionFromIntent(intent)
	}

	/**
	 * Returns the name of the main component registered from JavaScript. This is used to schedule
	 * rendering of the component.
	 */
	override fun getMainComponentName(): String = "main"

	/**
	 * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
	 * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
	 */
	override fun createReactActivityDelegate(): ReactActivityDelegate =
		ReactActivityDelegateWrapper(
			this,
			BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
			object : DefaultReactActivityDelegate(
				this,
				mainComponentName,
				fabricEnabled,
			) {},
		)

	/**
	 * Align the back button behavior with Android S
	 * where moving root activities to background instead of finishing activities.
	 * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
	 */
	override fun invokeDefaultOnBackPressed() {
		if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
			if (!moveTaskToBack(false)) {
				// For non-root activities, use the default implementation to finish them.
				super.invokeDefaultOnBackPressed()
			}
			return
		}

		// Use the default back button implementation on Android S
		// because it's doing more than [Activity.moveTaskToBack] in fact.
		super.invokeDefaultOnBackPressed()
	}
}
