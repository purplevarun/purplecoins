/**
 * Additive column migrations applied after the base schema is created.
 *
 * These exist for installs created before a given column was introduced;
 * each statement is safe to re-run because the caller ignores "duplicate
 * column" failures (SQLite has no `ADD COLUMN IF NOT EXISTS`).
 *
 * Exported separately from `initializeDatabase.ts` so that test harnesses
 * can apply the exact same migrations a real device would receive, without
 * needing the native `expo-sqlite` bindings.
 */
const SCHEMA_MIGRATIONS: readonly string[] = [
	`ALTER TABLE cards ADD COLUMN card_type TEXT NOT NULL DEFAULT 'CREDIT_CARD';`,
	`ALTER TABLE sources ADD COLUMN archived INTEGER;`,
	`ALTER TABLE categories ADD COLUMN archived INTEGER;`,
	`ALTER TABLE trips ADD COLUMN archived INTEGER;`,
	`ALTER TABLE investments ADD COLUMN archived INTEGER;`,
	`ALTER TABLE categories ADD COLUMN type TEXT NOT NULL DEFAULT 'EXPENSE';
	UPDATE categories SET type = CASE WHEN is_income = 1 THEN 'INCOME' ELSE 'EXPENSE' END;`,
	`ALTER TABLE categories DROP COLUMN is_income;`,
];

export default SCHEMA_MIGRATIONS;
