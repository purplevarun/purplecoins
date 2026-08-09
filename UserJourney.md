# PurpleCoins User Journey (Full App Coverage)

## Purpose

This document defines a complete user journey that validates the major product areas end-to-end, using both automated Maestro flows and focused manual checks.

It is intended for:

1. Pre-release confidence checks.
2. Regression testing after schema, service, or UI updates.
3. Team onboarding so anyone can understand core product behavior quickly.

## Scope

The journey covers all primary modes and screens exposed by app navigation:

1. Finance mode
2. Tools mode
3. Vault mode
4. Settings and backup
5. Global search
6. App logs

## Coverage Verdict

The existing Maestro flows provide strong feature coverage, but they do not fully validate long-horizon analytical correctness on their own.

Current gaps in pure UI flow coverage:

1. No large historical dataset (multiple months across multiple years).
2. No heavy-volume transaction scenario (5 to 6 transactions per month).
3. No direct UI automation for cross-year period math assertions in one seeded dataset.

To close this reliably, this repo now validates time-series math with deterministic integration tests in addition to Maestro navigation/form flows.

## Coverage Matrix

### A. Home and Mode Switching

1. Verify app launch and default home rendering.
2. Verify switching between Finance, Tools, and Vault.
3. Verify Settings and Search entry points are reachable.

Automation:

1. .maestro/flows/00_smoke_navigation.yaml

### B. Finance: Relations (Sources, Categories, Trips, Investments)

1. Source lifecycle: create, duplicate guard, rename, validate, archive, restore.
2. Category lifecycle: create, rename/reclassify behavior, archive.
3. Trip lifecycle: create and duplicate-name handling.
4. Investment lifecycle: create and duplicate-name handling.

Automation:

1. .maestro/flows/01_relations_sources.yaml
2. .maestro/flows/02_relations_categories.yaml
3. .maestro/flows/03_relations_trips_investments.yaml

### C. Finance: Transactions

1. Create DEBIT transaction.
2. Create CREDIT transaction.
3. Create TRANSFER transaction.
4. Filter by classification.
5. Search transactions.
6. Edit/clone/delete behavior.

Automation:

1. .maestro/flows/04_transactions.yaml

### D. Finance: Budgets

1. Create budget.
2. Update budget period/details.
3. Delete budget.

Automation:

1. .maestro/flows/05_budgets.yaml

### E. Finance: Analysis and Exchange Rates

1. Validate analysis summary values and category breakdown behavior.
2. Validate period controls including YTD back/forward navigation.
3. Validate exchange rate manual entry/edit path.

Automation:

1. .maestro/flows/06_analysis.yaml
2. .maestro/flows/07_exchange_rates.yaml
3. .maestro/flows/15_analysis_ytd_navigation.yaml
4. src/services/analysisService.test.ts (high-volume multi-year range assertions)

### F. Tools Mode

1. Notes CRUD with folder support.
2. Todos CRUD with due-date and completion states.

Automation:

1. .maestro/flows/08_notes.yaml
2. .maestro/flows/09_todos.yaml

### G. Vault Mode

1. Password entries: create/edit/delete + copy behavior.
2. Card entries: create/edit/delete + copy number/CVV/PIN behavior.
3. Identity entries: create/edit/delete.

Automation:

1. .maestro/flows/10_vault_password.yaml
2. .maestro/flows/11_vault_card.yaml
3. .maestro/flows/12_vault_identity.yaml

### H. Global Search

1. Minimum query-length behavior.
2. Mode-specific search results for Finance, Tools, and Vault.

Automation:

1. .maestro/flows/13_global_search.yaml

### I. Settings and Backup

1. Display app version.
2. Native currency toggle.
3. Financial year start month.
4. Archived relations navigation.
5. Budget alerts settings.
6. Auto-backup settings (Android).
7. Export and restore entry points.

Automation:

1. .maestro/flows/14_settings_backup.yaml

### J. App Logs (Diagnostics)

1. Open Settings.
2. Open App Logs.
3. Verify toolbar actions are visible (Refresh and Clear).

Automation:

1. .maestro/flows/journey.yml (standalone persistent end-to-end user journey)

## Canonical Data Integrity Checks

The journey should preserve and validate source-of-truth metadata:

1. .version
2. .package
3. app.json (expo.version, expo.android.package, expo.android.versionCode)
4. package.json (version)
5. src/constants/version.ts

Recommended command before running journey:

1. ./run apply

## Execution Options

### Full Automated Journey

1. Ensure a build is installed on a device/emulator.
2. Run:
   1. ./run e2e
   2. maestro test .maestro/flows/journey.yml
   3. bun run test src/services/analysisService.test.ts

### Manual Spot Verification (Business Numbers)

After automation, manually verify:

1. Source balances reconcile with transaction history.
2. Category net totals reconcile with analysis net.
3. Analysis summary values are consistent for the selected period.

## Known Boundaries

1. Native OS share sheet and file picker are validated only up to app-side trigger points.
2. Some highly data-dependent flows are best validated with a deterministic fixture set.

## Recommended Release Gate

Run these before a release upload:

1. ./run apply
2. ./run lint
3. ./run test
4. ./run e2e
5. ./run buildCi
6. ./run release
