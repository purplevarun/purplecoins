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
	`CREATE TABLE IF NOT EXISTS merchant_category_rules (
	id TEXT PRIMARY KEY NOT NULL,
	merchant_key TEXT NOT NULL UNIQUE CHECK (length(trim(merchant_key)) > 0),
	category_id TEXT,
	source_id TEXT,
	usage_count INTEGER NOT NULL DEFAULT 1,
	last_used_at INTEGER NOT NULL,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_merchant_category_rules_merchant_key
	ON merchant_category_rules(merchant_key);`,
	`CREATE TABLE IF NOT EXISTS budget_alert_state (
	id TEXT PRIMARY KEY NOT NULL,
	budget_id TEXT NOT NULL,
	period_key TEXT NOT NULL,
	threshold INTEGER NOT NULL CHECK (threshold IN (80, 100)),
	notified_at INTEGER NOT NULL,
	UNIQUE (budget_id, period_key, threshold)
);
CREATE INDEX IF NOT EXISTS idx_budget_alert_state_budget
	ON budget_alert_state(budget_id);`,
];

export default SCHEMA_MIGRATIONS;
