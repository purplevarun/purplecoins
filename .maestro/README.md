# End-to-end tests (Maestro)

This directory contains [Maestro](https://maestro.mobile.dev) UI flows that
exercise PurpleCoins the way a real user would: tapping through screens,
filling in forms, and checking what ends up on screen. They complement the
Vitest unit suite in `src/`, which covers business logic (services,
repositories, utils) that doesn't require a running app.

## Why Maestro, and why not unit-test the UI layer?

React Native components (screens, hooks, providers, navigation) rely on
native modules (fonts, gestures, reanimated, SVG, icons, the SQLite
bindings) that only exist inside a real React Native runtime. This
project's unit tests run under Vitest + Node, which is fast and reliable
for pure logic but cannot render React Native components (see
`TESTING.md` at the repository root for the full rationale). Maestro
drives an actual build on a simulator/emulator/device, so it's the
correct tool for verifying screens, navigation, and gestures actually
work end-to-end.

## Prerequisites

1. Install the Maestro CLI (macOS/Linux):
    ```sh
    curl -Ls "https://get.maestro.mobile.dev" | bash
    ```
2. Have a **development build** of the app installed on a running
   iOS simulator, Android emulator, or physical device — Maestro drives
   the installed app, it does not build it. From the repository root:
    ```sh
    bun run android   # or: expo run:ios
    ```
3. The app must be freshly installed (or the flows will accumulate data
   across runs, see below).

## Running the flows

```sh
# Whole suite
bun run test:e2e
# equivalent to: maestro test .maestro/flows

# A single flow, while iterating on it
maestro test .maestro/flows/04_transactions.yaml

# Interactive mode — great for writing/debugging a flow
maestro studio
```

## Design notes

- **Isolation**: every flow starts with `launchApp: { clearState: true }`,
  so each one runs against a clean, empty database and can be run
  independently or repeatedly without hitting "duplicate name" validation
  errors from a previous run's leftover data.
- **Selectors**: the app does not use `testID` anywhere (verified before
  writing these flows), so every step targets _visible text_ or
  `accessibilityLabel` — both of which Maestro's `tapOn`/`assertVisible`
  match against. Text inputs are targeted by their **placeholder**
  (e.g. `"Note title"`), since that's rendered on the input itself, as
  opposed to field _labels_, which are separate sibling elements.
- **Icon-only controls**: a few controls (the todo list's checkbox, the
  vault card's copy buttons) are icon-only `Pressable`s with no
  `accessibilityLabel`. They're targeted with Maestro's relative
  selectors (`rightOf`, `below`) instead of exact text, or — for the todo
  checkbox — worked around entirely by toggling "Completed" from the
  edit form instead. If you add an `accessibilityLabel` to these in the
  future, the flows can be simplified to plain `tapOn: "Label"`.
- **Native OS UI**: exporting a backup opens the native share sheet, and
  restoring opens the native document picker. Neither is part of the
  app's own UI, so the flows verify the app-side trigger (and, for
  export, dismiss the share sheet with `back`) rather than driving the
  OS chooser itself.

## Flow index

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
