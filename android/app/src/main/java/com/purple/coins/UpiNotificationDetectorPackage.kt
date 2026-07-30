package com.purple.coins.experimental

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class UpiNotificationDetectorPackage : ReactPackage {
	override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
		listOf(UpiNotificationDetectorModule(reactContext))

	override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
