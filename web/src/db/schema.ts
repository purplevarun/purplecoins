const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS sources (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(trim(name)) > 0),
	currency_code TEXT NOT NULL CHECK (length(currency_code) = 3),
	validated_at INTEGER,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(trim(name)) > 0),
	is_income INTEGER NOT NULL CHECK (is_income IN (0, 1)),
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(trim(name)) > 0),
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS investments (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(trim(name)) > 0),
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
	id TEXT PRIMARY KEY NOT NULL,
	classification TEXT NOT NULL CHECK (classification IN ('GENERAL', 'INVESTMENT')),
	type TEXT NOT NULL CHECK (type IN ('DEBIT', 'CREDIT', 'TRANSFER')),
	source_id TEXT NOT NULL,
	destination_source_id TEXT,
	amount TEXT NOT NULL CHECK (CAST(amount AS REAL) > 0),
	to_amount TEXT CHECK (to_amount IS NULL OR CAST(to_amount AS REAL) > 0),
	category_id TEXT,
	trip_id TEXT,
	investment_id TEXT,
	reason TEXT NOT NULL DEFAULT '',
	transaction_at INTEGER NOT NULL,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE RESTRICT,
	FOREIGN KEY (destination_source_id) REFERENCES sources(id) ON DELETE RESTRICT,
	FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
	FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE RESTRICT,
	FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE RESTRICT,
	CHECK (
		(
			classification = 'GENERAL'
			AND type IN ('DEBIT', 'CREDIT')
			AND category_id IS NOT NULL
			AND investment_id IS NULL
			AND destination_source_id IS NULL
			AND to_amount IS NULL
			AND length(trim(reason)) > 0
		)
		OR
		(
			classification = 'GENERAL'
			AND type = 'TRANSFER'
			AND destination_source_id IS NOT NULL
			AND destination_source_id <> source_id
			AND to_amount IS NOT NULL
			AND category_id IS NULL
			AND trip_id IS NULL
			AND investment_id IS NULL
		)
		OR
		(
			classification = 'INVESTMENT'
			AND type IN ('DEBIT', 'CREDIT')
			AND investment_id IS NOT NULL
			AND category_id IS NULL
			AND trip_id IS NULL
			AND destination_source_id IS NULL
			AND to_amount IS NULL
			AND length(trim(reason)) > 0
		)
	)
);

CREATE TABLE IF NOT EXISTS budgets (
	id TEXT PRIMARY KEY NOT NULL,
	category_id TEXT NOT NULL,
	amount TEXT NOT NULL CHECK (CAST(amount AS REAL) > 0),
	period TEXT NOT NULL CHECK (period IN ('MONTHLY', 'YEARLY')),
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
	UNIQUE (category_id, period)
);

CREATE TABLE IF NOT EXISTS exchange_rates (
	currency_code TEXT PRIMARY KEY NOT NULL CHECK (length(currency_code) = 3),
	rate_to_inr TEXT NOT NULL CHECK (CAST(rate_to_inr AS REAL) > 0),
	source TEXT NOT NULL CHECK (source IN ('API', 'MANUAL')),
	fetched_at INTEGER,
	updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS folders (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(trim(name)) > 0),
	type TEXT NOT NULL CHECK (type IN ('NOTE', 'TODO')),
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
	id TEXT PRIMARY KEY NOT NULL,
	folder_id TEXT,
	title TEXT NOT NULL CHECK (length(trim(title)) > 0),
	content TEXT NOT NULL,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS todos (
	id TEXT PRIMARY KEY NOT NULL,
	folder_id TEXT,
	title TEXT NOT NULL CHECK (length(trim(title)) > 0),
	description TEXT NOT NULL DEFAULT '',
	is_done INTEGER NOT NULL CHECK (is_done IN (0, 1)),
	due_at INTEGER,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS passwords (
	id TEXT PRIMARY KEY NOT NULL,
	title TEXT NOT NULL CHECK (length(trim(title)) > 0),
	username TEXT NOT NULL DEFAULT '',
	password TEXT NOT NULL,
	website TEXT NOT NULL DEFAULT '',
	notes TEXT NOT NULL DEFAULT '',
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cards (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL CHECK (length(trim(name)) > 0),
	card_number TEXT NOT NULL,
	expiry TEXT NOT NULL DEFAULT '',
	cvv TEXT NOT NULL DEFAULT '',
	pin TEXT NOT NULL DEFAULT '',
	network TEXT NOT NULL DEFAULT '',
	notes TEXT NOT NULL DEFAULT '',
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS identities (
	id TEXT PRIMARY KEY NOT NULL,
	title TEXT NOT NULL CHECK (length(trim(title)) > 0),
	id_number TEXT NOT NULL DEFAULT '',
	notes TEXT NOT NULL DEFAULT '',
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS attachments (
	id TEXT PRIMARY KEY NOT NULL,
	owner_type TEXT NOT NULL CHECK (
		owner_type IN ('TRANSACTION', 'NOTE', 'TODO', 'CARD', 'IDENTITY')
	),
	owner_id TEXT NOT NULL,
	file_name TEXT NOT NULL,
	mime_type TEXT NOT NULL,
	size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 2097152),
	content BLOB NOT NULL,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	UNIQUE (owner_type, owner_id)
);

CREATE TABLE IF NOT EXISTS settings (
	key TEXT PRIMARY KEY NOT NULL,
	value TEXT NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_date
	ON transactions(transaction_at DESC);
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
CREATE INDEX IF NOT EXISTS idx_attachments_owner
	ON attachments(owner_type, owner_id);
`;

export { SCHEMA_SQL };
