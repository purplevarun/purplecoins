# Local Android APK Release

This branch builds the experimental Android app as:

- App name: `Purplecoins_Experimental`
- Android package/application id: `com.purple.coins.experimental`

Because the package is different from the production v5 app, Android can keep
both apps installed on the same phone.

## Prerequisites

Install these before building:

- Node.js and Bun
- Java 17 or newer
- Android Studio or Android SDK command-line tools
- Android SDK Platform and Build Tools matching the project

From the repository root, install dependencies:

```sh
bun install
```

## Build The APK

From the repository root on macOS or Linux:

```sh
cd android
./gradlew clean assembleRelease
```

From the repository root on Windows PowerShell:

```powershell
cd android
.\gradlew.bat clean assembleRelease
```

The generated APK will be here:

```text
android/app/build/outputs/apk/release/app-release.apk
```

For easier sharing, copy or rename it from the repository root:

```powershell
Copy-Item .\android\app\build\outputs\apk\release\app-release.apk .\Purplecoins_Experimental-release.apk
```

## Install On A Device

With USB debugging enabled and the device connected:

```sh
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

This updates only the experimental app because its package is
`com.purple.coins.experimental`. The production app with package
`com.purple.coins` remains installed separately.

## Notes

- The local `assembleRelease` APK currently uses the debug keystore configured
  in `android/app/build.gradle`, so it is suitable for local testing.
- For a Play Store or externally distributed production release, configure a
  real release keystore and signing config before building.
- Avoid `npx expo prebuild --clean` unless you intentionally want to regenerate
  the native Android project and re-check any custom native code.
