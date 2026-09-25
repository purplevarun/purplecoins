# Purplecoins

Purplecoins is a local-first Expo Android application for finance, utilities,
and private vault records. SQLite is the source of truth.

## Highlights

- General debit, credit, and transfer transactions
- Split expenses with multiple categorized items in one payment
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
- A general debit has one or more amount/category items, with a shared source,
  date, reason, optional trip, and receipt. Its total is the sum of its items.
- A general credit has exactly one category and may have one trip.
- Source balances and transaction counts include each payment once. Category
  analysis and budgets allocate expense amounts using the individual items.
- A blank expense reason defaults to the distinct item category names.
- Creating, editing, or deleting an expense keeps its items and receipt atomic.
- An investment transaction has one source and one investment only.
- Transfers have a source, destination, from amount, and to amount.
- Transfers are excluded from category analysis.
- Category net is `credits - debits`.
- `is_income` selects the analysis bucket; the net sign never changes it.
- Investment net is `total invested - total redeemed`.
- Source currency is immutable after creation.

## Transaction Views

The button immediately left of Search switches between day and scroll views.
Day view queries only the selected calendar day. The arrows move between days
without loading the rest of the transaction history.

Scroll view is the default and starts with the 10 most recently created
transactions, regardless of their transaction dates, without a date-range heading.
**Load more** appends the next 10 transactions, or the remaining transactions if
fewer are available. The button is hidden when the list is empty or no more
transactions remain. Failed loads can be retried without discarding already-loaded
rows. Paging uses creation time and transaction ID to keep a stable order when
multiple transactions share the same creation timestamp.

Search and classification filters apply to the loaded transactions. Switching
views retains the selected date and filters; changing views or refreshing data
resets scroll pagination to its first 10 transactions.

Expense search includes item categories and amounts. Category-linked lists show
the matched allocation alongside the payment total. Opening a split payment
allows editing all items together; cloning creates a new payment and new item IDs.

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

Shared domain types live in `app/src/types`. Database access is contained in
repositories, business rules live in services, and screens focus on
presentation and interaction.

Keep named types and object type definitions in dedicated type files. Test-only
types live in `app/test/types`, and download-site types live in `web/src/types`.
Reuse library prop types or existing domain types with `Pick`/`Omit` where suitable.
Native ESLint rejects local type declarations outside the type directories.

## Development

```powershell
cd app
bun install
bun run android
```

Run every local quality gate from the repository root:

```powershell
cd app
bun run check
```

The check command verifies formatting, ESLint, strict TypeScript, Vitest, and
Expo dependency compatibility.

## Backups

Settings can export the live database as
`purplecoins-YYYY-MM-DD.purplecoins`. The file is a complete SQLite snapshot,
including attachment BLOBs. Restore checks the picked file before replacing
local data.

### Database Setup

The app creates any missing current-schema tables automatically. The empty
`SCHEMA_MIGRATIONS` array is reserved for future SQL migrations and runs after
schema creation for both fresh databases and restored backups.

Backups must already contain the current schema, including transaction items.
Restore validates this before replacing live data. Older app versions may not
understand backups written by newer app versions.

### App Updates

Settings can check the latest GitHub release. When its release name differs from
the installed version, the app downloads the release APK and opens Android's
installer. Android may ask you to allow installs from Purplecoins first.

**Privacy:** Backups are unencrypted and may include passwords, card details,
identities, and financial records. Keep them private. Backup files remain ignored
by Git to prevent accidental commits.
