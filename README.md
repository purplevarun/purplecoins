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

### Migrate an Older Backup

The [migration runner](scripts/migrate_backup.py) applies [migrations.sql](migrations.sql)
to a copy of an existing backup. It preserves records and attachments, handles
already-added columns, checks SQLite integrity and foreign keys, and produces a
standalone file without WAL sidecars. It never overwrites the input or an existing
output, and failed migrations do not publish a partial backup. Currently, the SQL
adds investment types and the investment metadata columns.

For sensitive backups, run locally with Python 3.10 or newer (no dependencies):

```sh
python3 -B scripts/migrate_backup.py original.purplecoins migrated.purplecoins
```

To use [GitHub Actions](.github/workflows/migrate-backup.yml):

1. Make the input file available through a direct HTTPS download URL. GitHub's
   manual workflow form does not support file uploads. The download must not need
   an interactive login or a separate authorization header, and is limited to
   512 MiB.
2. Store a private or signed URL as the repository Actions secret
   `PURPLECOINS_BACKUP_URL`. For a non-sensitive URL, use the `backup_url` workflow
   input instead. Supply only one of these, and keep it valid until the download
   completes. Do not put credentials or signed URLs in the visible workflow input.
3. Open **Actions > Migrate PurpleCoins Backup > Run workflow**, select `main`,
   acknowledge the unencrypted upload, and run it.
4. Download the `migrated-purplecoins-<run-id>-<attempt>` artifact from the completed
   run and extract `migrated.purplecoins`. Restore that file through the app's
   Settings. The artifact expires after one day; delete it sooner when finished.

**Privacy:** Backups are unencrypted and may include passwords, card details,
identities, and financial records. Repository readers can download Actions
artifacts; do not use a public repository workflow for sensitive backups. A secret
URL hides the URL in logs, not the output artifact. Prefer local migration for
private data. The workflow never commits backups and removes its runner copies
even on failure. Backup files are also ignored by Git to prevent accidental commits.

The workflow tests the runner before downloading the input. Run the same tests
locally with:

```sh
python3 -B -m unittest discover -s scripts -p 'test_migrate_backup.py' -v
```
