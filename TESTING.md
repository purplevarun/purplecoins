# Testing

PurpleCoins has two complementary automated test layers:

1. **Unit tests** (Vitest) — business logic: services, repositories,
   utilities, and a couple of pure helpers extracted from the UI layer
   specifically to make them testable.
2. **End-to-end tests** (Maestro) — full user journeys driven against a
   real running build, covering navigation, forms, and everything in the
   component/screen layer that unit tests intentionally don't touch.

## Quick start

```sh
bun run test              # unit tests, once
bun run test:watch        # unit tests, watch mode
bun run test:coverage     # unit tests with a coverage report
bun run test:e2e          # Maestro E2E suite (requires a running build; see .maestro/README.md)
```

`bun run check` (the full local quality gate) runs the unit suite along
with formatting, linting, and type-checking. It does **not** run the E2E
suite, since that requires a booted simulator/emulator with a build
installed — see [`.maestro/README.md`](.maestro/README.md) for setup.

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs formatting,
linting, type-checking, and the unit suite (with coverage, uploaded as a
build artifact) on every push and pull request targeting `main`/`mac`.
It intentionally does not run the Maestro suite — that needs a real
build on a booted emulator/simulator, a heavier and separate concern
from this fast, hosted-runner-friendly gate. Run `bun run test:e2e`
locally (or wire up a dedicated device-backed workflow) before releases.

## Unit tests

### What's covered

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

### How database-backed tests work without a device

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

### Why the UI layer (components/screens/hooks/providers/navigation) has no unit tests

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

### Known unreachable branches

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

## End-to-end tests

See [`.maestro/README.md`](.maestro/README.md) for the full flow index,
setup instructions, and design notes (selector strategy, isolation via
`clearState`, and known limitations around icon-only controls and
native OS UI like the share sheet / document picker). In short: 15 flows
under `.maestro/flows/` drive a real build through every major journey
— sources, categories, trips, investments, transactions, budgets,
analysis, exchange rates, notes, todos, all three vault kinds, global
search, and settings/backup — using only visible text and accessibility
labels, since the app has no `testID`s.
