## Prebuild Setup

1. Download xCode
2. `brew install ruby-install chruby`
3. `ruby-install --latest ruby`
4. Check version using `chruby`
5. Switch to latest version `chruby <ruby-version>`
6. Run `npx expo prebuild --clean`

Create `local.properties` in `android/`  
sdk.dir = /Users/purplevarun/Library/Android/sdk