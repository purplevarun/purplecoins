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

## Backups

Settings can export the live database as
`purplecoins-YYYY-MM-DD.purplecoins`. The file is a complete SQLite snapshot,
including attachment BLOBs. Restore checks the picked file before replacing
local data.

The PurpleCoins v2 migration can target the documented Purplecoins schema
without changing the app's runtime data model.
