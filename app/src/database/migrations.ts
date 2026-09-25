const SCHEMA_MIGRATIONS: readonly string[] = [
	// Add platforms table
	`
	CREATE TABLE IF NOT EXISTS investment_platforms (
		id TEXT,
		name TEXT,
		archived INTEGER,
		created_at INTEGER,
		updated_at INTEGER
	);
	`,
	// Add trip_types table
	`
	CREATE TABLE IF NOT EXISTS trip_types (
		id TEXT,
		name TEXT,
		created_at INTEGER,
		updated_at INTEGER
	);
	`,
	// Add platform_id to investments. Existing databases may already have it.
	`
	ALTER TABLE investments ADD COLUMN platform_id TEXT;
	CREATE INDEX IF NOT EXISTS idx_investments_platform
		ON investments(platform_id);
	`,
	// Add trip_type_id to trips. Existing databases may already have it.
	`
	ALTER TABLE trips ADD COLUMN trip_type_id TEXT;
	`,
	// Rebuild every existing table so legacy constraints are removed as well.
	`
	PRAGMA foreign_keys = OFF;
	BEGIN;
	DROP TABLE IF EXISTS sources_new;
	CREATE TABLE sources_new AS SELECT * FROM sources;
	DROP TABLE sources;
	ALTER TABLE sources_new RENAME TO sources;
	DROP TABLE IF EXISTS categories_new;
	CREATE TABLE categories_new AS SELECT * FROM categories;
	DROP TABLE categories;
	ALTER TABLE categories_new RENAME TO categories;
	DROP TABLE IF EXISTS trips_new;
	CREATE TABLE trips_new AS SELECT * FROM trips;
	DROP TABLE trips;
	ALTER TABLE trips_new RENAME TO trips;
	DROP TABLE IF EXISTS investment_types_new;
	CREATE TABLE investment_types_new AS SELECT * FROM investment_types;
	DROP TABLE investment_types;
	ALTER TABLE investment_types_new RENAME TO investment_types;
	DROP TABLE IF EXISTS investments_new;
	CREATE TABLE investments_new AS SELECT * FROM investments;
	DROP TABLE investments;
	ALTER TABLE investments_new RENAME TO investments;
	DROP TABLE IF EXISTS investment_platforms_new;
	CREATE TABLE investment_platforms_new AS SELECT * FROM investment_platforms;
	DROP TABLE investment_platforms;
	ALTER TABLE investment_platforms_new RENAME TO investment_platforms;
	DROP TABLE IF EXISTS trip_types_new;
	CREATE TABLE trip_types_new AS SELECT * FROM trip_types;
	DROP TABLE trip_types;
	ALTER TABLE trip_types_new RENAME TO trip_types;
	DROP TABLE IF EXISTS transactions_new;
	CREATE TABLE transactions_new AS SELECT * FROM transactions;
	DROP TABLE transactions;
	ALTER TABLE transactions_new RENAME TO transactions;
	DROP TABLE IF EXISTS transaction_items_new;
	CREATE TABLE transaction_items_new AS SELECT * FROM transaction_items;
	DROP TABLE transaction_items;
	ALTER TABLE transaction_items_new RENAME TO transaction_items;
	DROP TABLE IF EXISTS budgets_new;
	CREATE TABLE budgets_new AS SELECT * FROM budgets;
	DROP TABLE budgets;
	ALTER TABLE budgets_new RENAME TO budgets;
	DROP TABLE IF EXISTS exchange_rates_new;
	CREATE TABLE exchange_rates_new AS SELECT * FROM exchange_rates;
	DROP TABLE exchange_rates;
	ALTER TABLE exchange_rates_new RENAME TO exchange_rates;
	DROP TABLE IF EXISTS folders_new;
	CREATE TABLE folders_new AS SELECT * FROM folders;
	DROP TABLE folders;
	ALTER TABLE folders_new RENAME TO folders;
	DROP TABLE IF EXISTS notes_new;
	CREATE TABLE notes_new AS SELECT * FROM notes;
	DROP TABLE notes;
	ALTER TABLE notes_new RENAME TO notes;
	DROP TABLE IF EXISTS todos_new;
	CREATE TABLE todos_new AS SELECT * FROM todos;
	DROP TABLE todos;
	ALTER TABLE todos_new RENAME TO todos;
	DROP TABLE IF EXISTS passwords_new;
	CREATE TABLE passwords_new AS SELECT * FROM passwords;
	DROP TABLE passwords;
	ALTER TABLE passwords_new RENAME TO passwords;
	DROP TABLE IF EXISTS cards_new;
	CREATE TABLE cards_new AS SELECT * FROM cards;
	DROP TABLE cards;
	ALTER TABLE cards_new RENAME TO cards;
	DROP TABLE IF EXISTS identities_new;
	CREATE TABLE identities_new AS SELECT * FROM identities;
	DROP TABLE identities;
	ALTER TABLE identities_new RENAME TO identities;
	DROP TABLE IF EXISTS attachments_new;
	CREATE TABLE attachments_new AS SELECT * FROM attachments;
	DROP TABLE attachments;
	ALTER TABLE attachments_new RENAME TO attachments;
	DROP TABLE IF EXISTS settings_new;
	CREATE TABLE settings_new AS SELECT * FROM settings;
	DROP TABLE settings;
	ALTER TABLE settings_new RENAME TO settings;
	CREATE INDEX IF NOT EXISTS idx_transactions_date
		ON transactions(transaction_at DESC);
	CREATE INDEX IF NOT EXISTS idx_transactions_created
		ON transactions(created_at DESC, id DESC);
	CREATE INDEX IF NOT EXISTS idx_transactions_source
		ON transactions(source_id);
	CREATE INDEX IF NOT EXISTS idx_transactions_destination
		ON transactions(destination_source_id);
	CREATE INDEX IF NOT EXISTS idx_transactions_category
		ON transactions(category_id);
	CREATE INDEX IF NOT EXISTS idx_transactions_trip
		ON transactions(trip_id);
	CREATE INDEX IF NOT EXISTS idx_transactions_investment
		ON transactions(investment_id);
	CREATE INDEX IF NOT EXISTS idx_investments_type
		ON investments(investment_type_id);
	CREATE INDEX IF NOT EXISTS idx_investments_platform
		ON investments(platform_id);
	CREATE INDEX IF NOT EXISTS idx_transaction_items_category
		ON transaction_items(category_id);
	CREATE INDEX IF NOT EXISTS idx_attachments_owner
		ON attachments(owner_type, owner_id);
	COMMIT;
	PRAGMA foreign_keys = ON;
	`,
];

export default SCHEMA_MIGRATIONS;
