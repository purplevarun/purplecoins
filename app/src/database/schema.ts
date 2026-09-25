const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sources (
	id TEXT,
	name TEXT,
	currency_code TEXT,
	archived INTEGER,
	validated_at INTEGER,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS categories (
	id TEXT,
	name TEXT,
	is_income INTEGER,
	archived INTEGER,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS trips (
	id TEXT,
	name TEXT,
	archived INTEGER,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS investment_types (
	id TEXT,
	name TEXT,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS investments (
	id TEXT,
	name TEXT,
	investment_type_id TEXT,
	archived INTEGER,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS investment_platforms (
	id TEXT,
	name TEXT,
	archived INTEGER,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS trip_types (
	id TEXT,
	name TEXT,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS transactions (
	id TEXT,
	classification TEXT,
	type TEXT,
	source_id TEXT,
	destination_source_id TEXT,
	amount TEXT,
	to_amount TEXT,
	category_id TEXT,
	trip_id TEXT,
	investment_id TEXT,
	reason TEXT DEFAULT '',
	transaction_at INTEGER,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS transaction_items (
	id TEXT,
	transaction_id TEXT,
	category_id TEXT,
	amount TEXT,
	position INTEGER,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS budgets (
	id TEXT,
	category_id TEXT,
	amount TEXT,
	period TEXT,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS exchange_rates (
	currency_code TEXT,
	rate_to_inr TEXT,
	source TEXT,
	fetched_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS folders (
	id TEXT,
	name TEXT,
	type TEXT,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS notes (
	id TEXT,
	folder_id TEXT,
	title TEXT,
	content TEXT,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS todos (
	id TEXT,
	folder_id TEXT,
	title TEXT,
	description TEXT DEFAULT '',
	is_done INTEGER,
	due_at INTEGER,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS passwords (
	id TEXT,
	title TEXT,
	username TEXT DEFAULT '',
	password TEXT,
	website TEXT DEFAULT '',
	notes TEXT DEFAULT '',
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS cards (
	id TEXT,
	name TEXT,
	card_number TEXT,
	card_type TEXT DEFAULT 'CREDIT_CARD',
	expiry TEXT DEFAULT '',
	cvv TEXT DEFAULT '',
	pin TEXT DEFAULT '',
	network TEXT DEFAULT '',
	notes TEXT DEFAULT '',
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS identities (
	id TEXT,
	title TEXT,
	id_number TEXT DEFAULT '',
	notes TEXT DEFAULT '',
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS attachments (
	id TEXT,
	owner_type TEXT,
	owner_id TEXT,
	file_name TEXT,
	mime_type TEXT,
	size_bytes INTEGER,
	content BLOB,
	created_at INTEGER,
	updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS settings (
	key TEXT,
	value TEXT,
	updated_at INTEGER
);

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
CREATE INDEX IF NOT EXISTS idx_transaction_items_category
	ON transaction_items(category_id);
CREATE INDEX IF NOT EXISTS idx_attachments_owner
	ON attachments(owner_type, owner_id);
`;

export default SCHEMA_SQL;
