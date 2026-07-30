# Purplecoins

Purplecoins is a local-first Expo Android application for finance, utilities,
and private vault records. SQLite is the source of truth.

## Highlights

- General debit, credit, and transfer transactions
- Investment debit and credit transactions
- Exact decimal amounts stored as canonical decimal strings
- Cross-currency transfers with independent `amount` and `to_amount`
- Sources, categories, trips, investments, and calendar budgets
- Category-driven analysis with month, year, all-time, and custom periods
- INR analysis backed by persisted manual and API-fetched exchange rates
- Source validation based on the latest linked transaction timestamp
- Notes, todos, folders, passwords, cards, and identity records
- One SQLite-backed attachment per supported record, limited to 2 MB
- Plain `.purplecoins` SQLite backup export and restore

## Finance Rules

- Credits include income, reimbursements, refunds, and redemptions.
- Debits include expenses and invested amounts.
- A general debit or credit has exactly one category and may have one trip.
- An investment transaction has one source and one investment only.
- Transfers have a source, destination, from amount, and to amount.
- Transfers are excluded from category analysis.
- Category net is `credits - debits`.
- `is_income` selects the analysis bucket; the net sign never changes it.
- Investment net is `total invested - total redeemed`.
- Source currency is immutable after creation.

## Architecture

Dependencies flow in one direction:

```text
Screens and components
        |
Hooks and services
        |
Repositories
        |
Expo SQLite
```

Shared domain types live in `src/types`. Database access is contained in
repositories, business rules live in services, and screens focus on
presentation and interaction.

## Development

```powershell
bun install
bun run android
```

Run every local quality gate:

```powershell
bun run check
```

The check command verifies formatting, ESLint, strict TypeScript, Vitest, and
Expo dependency compatibility.

## Testing

PurpleCoins has two complementary automated test layers:

1. **Unit tests** (Vitest) — business logic: services, repositories,
   utilities, and a couple of pure helpers extracted from the UI layer
   specifically to make them testable.
2. **End-to-end tests** (Maestro) — full user journeys driven against a
   real running build, covering navigation, forms, and everything in the
   component/screen layer that unit tests intentionally don't touch.

```powershell
bun run test           # unit tests, once
bun run test:watch     # unit tests, watch mode
bun run test:coverage  # unit tests with a coverage report
bun run test:e2e       # Maestro end-to-end flows (needs a running build; see below)
```

`bun run check` (the full local quality gate) runs the unit suite along
with formatting, linting, and type-checking. It does **not** run the E2E
suite, since that requires a booted simulator/emulator with a build
installed.

### Continuous integration

- [`.github/workflows/unit-tests.yml`](.github/workflows/unit-tests.yml)
  runs the Vitest suite with coverage on every push (any branch) and
  uploads the coverage report as a build artifact.
- [`.github/workflows/e2e-tests.yml`](.github/workflows/e2e-tests.yml)
  runs the full Maestro suite against a real Android emulator on every
  push (any branch), records a video of the run, and uploads both the
  JUnit report and the video as build artifacts.
- [`.github/workflows/android-apk-on-version.yml`](.github/workflows/android-apk-on-version.yml)
  triggers an EAS Android build whenever `app.json` changes, plus a
  manual trigger with a selectable build profile.

### Unit tests

#### What's covered

Every service in `src/services`, every repository in `src/repositories`,
and every utility in `src/utils` has a corresponding `*.test.ts` file.
Coverage of that business-logic layer is **99%+ statements/branches**
(run `bun run test:coverage` and open `coverage/index.html` for the
full breakdown). The handful of intentionally-uncovered lines are
documented dead code — see "Known unreachable branches" below.

Roughly, each service's test file covers:

- The happy path for every exported function.
- Every validation error the function can throw (empty/blank input,
  invalid amounts, duplicate names, malformed currency codes, etc.),
  asserted by the `AppError.code` it throws.
- Foreign-key-in-use deletion guards (e.g. deleting a category still
  referenced by a transaction), including a test that an _unrelated_
  database error is rethrown unchanged rather than being misclassified.
- Boolean/number coercions performed when mapping SQLite rows (SQLite
  has no boolean type) back to domain objects.
- Archived/active filtering, sorting, and other list-shaping logic.

#### How database-backed tests work without a device

`expo-sqlite` wraps native iOS/Android/web bindings that don't exist in
a plain Node process, so it can't be used directly in Vitest. Instead,
[`src/test/sqliteTestDatabase.ts`](src/test/sqliteTestDatabase.ts)
adapts Node's own built-in `node:sqlite` module behind the exact same
async method names the app calls (`execAsync`, `runAsync`,
`getAllAsync`, `getFirstAsync`, `withTransactionAsync`, `closeAsync`),
and applies the **real** production schema
(`src/database/schema.ts`) plus the same migrations
`initializeDatabase.ts` runs on a real device
(`src/database/migrations.ts`, shared by both so they can never drift).

This means repository and service tests exercise real SQL: real `CHECK`
constraints, real `FOREIGN KEY` behavior, real `UNIQUE` conflicts — not
hand-rolled mocks that could quietly diverge from how SQLite actually
behaves. [`src/test/dbFixtures.ts`](src/test/dbFixtures.ts) provides
small factories (`insertSource`, `insertCategory`, `insertTrip`,
`insertInvestment`) for setting up foreign-key-valid prerequisite rows.

A handful of services also touch Expo modules with real native
bindings (`expo-document-picker`, `expo-file-system`, `expo-sharing`,
and `expo-sqlite`'s `openDatabaseAsync`/`backupDatabaseAsync`). Those
are mocked with `vi.mock` in `attachmentService.test.ts`,
`backupService.test.ts`, and `initializeDatabase.test.ts` so their
control flow (validation, error branches, cleanup-in-`finally`) is
still fully tested without needing real native code.

`expo-crypto` (used by `src/utils/id.ts` for UUID generation) is mocked
globally in [`src/test/setup.ts`](src/test/setup.ts) because it
transitively imports `react-native`, whose entry point uses Flow syntax
that Vitest's transform can't parse — see the next section.

#### Why the UI layer (components/screens/hooks/providers/navigation) has no unit tests

This was a deliberate scope decision, not an oversight:

- Importing the real `react-native` package under Vitest fails outright
  (`Flow is not supported`) — React Native's source uses Flow type
  syntax that Vitest's esbuild/rolldown-based transform cannot parse.
  Every component and screen in this app imports `react-native`.
- Rendering React Native components for real requires a preset like
  `jest-expo` that mocks dozens of native modules (fonts, Reanimated,
  gesture-handler, SVG, icons, the new architecture's Fabric renderer).
  That preset is built for Jest, not Vitest, and reimplementing it is a
  substantial, fragile undertaking with its own long-term maintenance
  cost — for a payoff (rendering assertions) that Maestro already
  delivers more faithfully, against a real device instead of a JS-only
  approximation of one.
- Introducing Jest _alongside_ Vitest just for component rendering would
  mean maintaining two parallel, differently-configured test runners in
  one project.

Given that trade-off, this project keeps one fast, reliable, native
Vitest suite for everything that benefits from it (pure logic), and
uses Maestro — driving an actual build — for everything that needs a
real UI. Two pieces of non-trivial UI logic were **extracted into
plain, unit-testable modules** specifically so they wouldn't be stuck
untested behind that boundary:

- `GlobalSearchScreen`'s per-mode result-building and search-filtering
  logic → [`src/services/globalSearchService.ts`](src/services/globalSearchService.ts)
  (see `globalSearchService.test.ts`).
- `DonutChart`'s segment-geometry math → [`src/utils/donutChart.ts`](src/utils/donutChart.ts)
  (see `donutChart.test.ts`).

This mirrors a pattern the codebase already used before this test suite
existed (`analysisService.buildCategoryAnalysis`, `tripTotalService.buildTripTotals`):
keep pure calculations in a plain module, keep the component thin.

`vitest.config.ts`'s coverage `exclude` list reflects this boundary
explicitly, so the coverage report reflects "how well is the tested
layer tested" rather than showing a misleading blanket number that
conflates two very different kinds of code.

#### Known unreachable branches

Three lines are deliberately left uncovered, each with a `NOTE:` comment
at the site explaining why, discovered _because_ coverage tooling
flagged them while building this suite:

- `src/utils/money.ts` — `normalizeMoney`'s "amount must be greater than
  zero" throw. The regex above it already rejects negative numbers, and
  `decimal.js` treats zero's sign as non-negative, so this can never
  actually be reached through the function's public contract.
- `src/services/transactionService.ts` — the `TRANSFER_AMOUNT_MISMATCH`
  throw. For a same-currency transfer, `toAmount` is unconditionally set
  equal to `amount` before the two are compared, so the comparison can
  never differ.
- `src/services/tripTotalService.ts` — a defensive `if (!tripId) return;`
  inside `buildTripTotals`. The upstream filter already guarantees
  `tripId` is truthy for anything reaching that line.

### End-to-end tests (Maestro)

[Maestro](https://maestro.mobile.dev) UI flows under `.maestro/flows/`
exercise PurpleCoins the way a real user would: tapping through screens,
filling in forms, and checking what ends up on screen. They complement
the Vitest unit suite, which covers business logic that doesn't require
a running app. React Native components rely on native modules (fonts,
gestures, reanimated, SVG, icons, the SQLite bindings) that only exist
inside a real React Native runtime, so Maestro drives an actual build on
a simulator/emulator/device instead.

#### Prerequisites

Install Java 17 or newer, then install the Maestro CLI:

macOS/Linux:

```sh
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

macOS with Homebrew:

```sh
brew tap mobile-dev-inc/tap
brew trust --formula mobile-dev-inc/tap/maestro
brew install mobile-dev-inc/tap/maestro
```

Windows:

```powershell
Invoke-WebRequest https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip -OutFile maestro.zip
Expand-Archive .\maestro.zip C:\maestro
setx PATH "$env:PATH;C:\maestro\bin"
```

Restart the terminal after installing, then verify with `maestro --help`.

Have a **development build** of the app installed on a running iOS
simulator, Android emulator, or physical device — Maestro drives the
installed app, it does not build it:

```sh
bun run android   # or: expo run:ios
```

The app must be freshly installed, or the flows will accumulate data
across runs.

#### Running the flows

```sh
bun run test:e2e                             # whole suite
maestro test .maestro/flows/04_transactions.yaml  # a single flow
maestro studio                               # interactive mode
```

If `bun run test:e2e` fails with `bun: command not found: maestro`, the
Maestro CLI is not installed or its `bin` directory is not on `PATH`.
Install it with the steps above, restart the terminal, and run
`maestro --help` before trying the suite again.

#### Design notes

- **Isolation**: every flow starts with `launchApp: { clearState: true }`,
  so each one runs against a clean, empty database and can be run
  independently or repeatedly without hitting "duplicate name" validation
  errors from a previous run's leftover data.
- **Selectors**: the app does not use `testID` anywhere, so every step
  targets _visible text_ or `accessibilityLabel` — both of which
  Maestro's `tapOn`/`assertVisible` match against. Text inputs are
  targeted by their **placeholder** (e.g. `"Note title"`), since that's
  rendered on the input itself, as opposed to field _labels_, which are
  separate sibling elements.
- **Icon-only controls**: a few controls (the todo list's checkbox, the
  vault card's copy buttons) are icon-only `Pressable`s with no
  `accessibilityLabel`. They're targeted with Maestro's relative
  selectors (`rightOf`, `below`) instead of exact text, or — for the todo
  checkbox — worked around entirely by toggling "Completed" from the
  edit form instead.
- **Native OS UI**: exporting a backup opens the native share sheet, and
  restoring opens the native document picker. Neither is part of the
  app's own UI, so the flows verify the app-side trigger (and, for
  export, dismiss the share sheet with `back`) rather than driving the
  OS chooser itself.

#### Flow index

| File                                  | Covers                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| `00_smoke_navigation.yaml`            | App launch, Tools/Finance/Vault mode switcher, Settings, global search entry point    |
| `01_relations_sources.yaml`           | Sources: create, duplicate-name guard, validate, rename, archive, restore             |
| `02_relations_categories.yaml`        | Categories: create, income/expense, reclassification confirmation, archive            |
| `03_relations_trips_investments.yaml` | Trips and investments: create, duplicate-name guard                                   |
| `04_transactions.yaml`                | Debit/credit/transfer, category/source selection, filter, search, edit, clone, delete |
| `05_budgets.yaml`                     | Create, edit period, delete                                                           |
| `06_analysis.yaml`                    | Category breakdown, period selector, link to exchange rates                           |
| `07_exchange_rates.yaml`              | Manual rate entry and edit for a foreign-currency source                              |
| `08_notes.yaml`                       | Folder creation, note create/edit/delete                                              |
| `09_todos.yaml`                       | Due date, completed toggle (via form), edit, delete                                   |
| `10_vault_password.yaml`              | Create, copy password, edit, delete                                                   |
| `11_vault_card.yaml`                  | Create, copy number/CVV/PIN, edit card type, delete                                   |
| `12_vault_identity.yaml`              | Create, edit, delete                                                                  |
| `13_global_search.yaml`               | Minimum-length gating, per-mode search results                                        |
| `14_settings_backup.yaml`             | Default home mode, native currency toggle, FY month, export/restore triggers          |

## Backups

Settings can export the live database as
`purplecoins-YYYY-MM-DD.purplecoins`. The file is a complete SQLite snapshot,
including attachment BLOBs. Restore checks the picked file before replacing
local data.

The PurpleCoins v2 migration can target the documented Purplecoins schema
without changing the app's runtime data model.

## SDK DIR

### MAC

```bash
echo "sdk.dir=/Users/$(whoami)/Library/Android/sdk" > android/local.properties
```

### Windows

```bash
echo "sdk.dir=C:\\Users\\$(whoami)\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

## Local Android APK Release (Experimental)

This branch builds the experimental Android app as:

- App name: `Purplecoins_Experimental`
- Android package/application id: `com.purple.coins.experimental`

Because the package is different from the production v5 app, Android can keep
both apps installed on the same phone.

### Prerequisites

Install these before building:

- Node.js and Bun
- Java 17 or newer
- Android Studio or Android SDK command-line tools
- Android SDK Platform and Build Tools matching the project

From the repository root, install dependencies:

```sh
bun install
```

### Build The APK

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

### Install On A Device

With USB debugging enabled and the device connected:

```sh
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

This updates only the experimental app because its package is
`com.purple.coins.experimental`. The production app with package
`com.purple.coins` remains installed separately.

### Notes

- The local `assembleRelease` APK currently uses the debug keystore configured
  in `android/app/build.gradle`, so it is suitable for local testing.
- For a Play Store or externally distributed production release, configure a
  real release keystore and signing config before building.
- Avoid `npx expo prebuild --clean` unless you intentionally want to regenerate
  the native Android project and re-check any custom native code.
