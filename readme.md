## Frontend Prebuild Setup

1. Download xCode
2. `brew install ruby-install chruby`
3. `ruby-install --latest ruby`
4. Check version using `chruby`
5. Switch to latest version `chruby <ruby-version>`
6. Run `npx expo prebuild --clean`

Create `local.properties` in `android/`  
sdk.dir = /Users/purplevarun/Library/Android/sdk

## Notes

1. New collection name in MongoDB = purpelcoinsv2 [to be fixed]
	1. Data needs to be migrated from other collections
	2. Needs to be renamed to purplecoins
2. Use separate stores for data in frontend
   1. Migrate all useStates to zustand
3. Separate all code into diff layers - controllers, stores, services,screens  