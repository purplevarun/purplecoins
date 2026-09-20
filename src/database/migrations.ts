import SCHEMA_SQL from "@/database/schema";
import type { SQLiteDatabase } from "expo-sqlite";

const PRE_SCHEMA_MIGRATIONS: readonly string[] = [
	"ALTER TABLE investments ADD COLUMN label TEXT;",
	"ALTER TABLE investments ADD COLUMN investment_type_id TEXT REFERENCES investment_types(id) ON DELETE SET NULL;",
];

const SCHEMA_MIGRATIONS: readonly string[] = [
	`
CREATE TABLE IF NOT EXISTS transaction_items (
	id TEXT PRIMARY KEY NOT NULL,
	transaction_id TEXT NOT NULL,
	category_id TEXT NOT NULL,
	amount TEXT NOT NULL CHECK (CAST(amount AS REAL) > 0),
	position INTEGER NOT NULL CHECK (position >= 0),
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL,
	FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
	FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
	UNIQUE (transaction_id, position)
);
CREATE INDEX IF NOT EXISTS idx_transaction_items_category
	ON transaction_items(category_id);
	`,
	`
INSERT INTO transaction_items (
	id, transaction_id, category_id, amount, position, created_at, updated_at
)
SELECT
	lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' ||
	lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' ||
	lower(hex(randomblob(6))),
	txn.id,
	txn.category_id,
	txn.amount,
	0,
	txn.created_at,
	txn.updated_at
FROM transactions txn
WHERE txn.classification = 'GENERAL'
	AND txn.type = 'DEBIT'
	AND txn.category_id IS NOT NULL
	AND NOT EXISTS (
		SELECT 1 FROM transaction_items item WHERE item.transaction_id = txn.id
	);
`,
];

const isExpectedMigrationError = (error: unknown): boolean =>
	error instanceof Error &&
	(/duplicate column name/i.test(error.message) ||
		/no such table/i.test(error.message));

const migrateDatabase = async (database: SQLiteDatabase): Promise<void> => {
	for (const migration of PRE_SCHEMA_MIGRATIONS) {
		try {
			await database.execAsync(migration);
		} catch (error) {
			if (!isExpectedMigrationError(error)) throw error;
		}
	}
	await database.execAsync(SCHEMA_SQL);
	for (const migration of SCHEMA_MIGRATIONS) {
		await database.execAsync(migration);
	}
};

export default migrateDatabase;
