import SCHEMA_SQL from "@/database/schema";
import AppError from "@/errors/AppError";
import type DatabaseIntegrityResult from "@/types/DatabaseIntegrityResult";
import type DatabaseVersionRow from "@/types/DatabaseVersionRow";
import type ExpenseAllocationRow from "@/types/ExpenseAllocationRow";
import type ExpenseAllocationTotal from "@/types/ExpenseAllocationTotal";
import type LegacyExpenseRow from "@/types/LegacyExpenseRow";
import type SimpleEntity from "@/types/SimpleEntity";
import createId from "@/utils/id";
import moneyUtils from "@/utils/money";
import type { SQLiteDatabase } from "expo-sqlite";

const { addMoney, compareMoney, ZERO_AMOUNT } = moneyUtils;
const DATABASE_VERSION = 2;

const ITEMS_SQL = `
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
`;

const REBUILD_TRANSACTIONS_SQL = `
CREATE TABLE transactions_next (
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
			AND ((type = 'DEBIT' AND category_id IS NULL)
				OR (type = 'CREDIT' AND category_id IS NOT NULL))
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
INSERT INTO transactions_next (
	id, classification, type, source_id, destination_source_id, amount,
	to_amount, category_id, trip_id, investment_id, reason,
	transaction_at, created_at, updated_at
)
SELECT id, classification, type, source_id, destination_source_id, amount,
	to_amount,
	CASE WHEN classification = 'GENERAL' AND type = 'DEBIT' THEN NULL ELSE category_id END,
	trip_id, investment_id, reason, transaction_at, created_at, updated_at
FROM transactions;
DROP TABLE transactions;
ALTER TABLE transactions_next RENAME TO transactions;
`;

const validateDatabase = async (database: SQLiteDatabase): Promise<void> => {
	const integrity = await database.getFirstAsync<DatabaseIntegrityResult>(
		"SELECT integrity_check AS integrity FROM pragma_integrity_check;",
	);
	const violations = await database.getAllAsync("PRAGMA foreign_key_check;");
	if (integrity?.integrity !== "ok" || violations.length > 0) {
		throw new AppError(
			"DATABASE_INTEGRITY_FAILED",
			"Database validation failed. Your data was not migrated.",
		);
	}
};

const validateExpenseItems = async (
	database: SQLiteDatabase,
): Promise<void> => {
	const invalidParent = await database.getFirstAsync(
		`SELECT item.id FROM transaction_items item
		 JOIN transactions txn ON txn.id = item.transaction_id
		 WHERE txn.classification <> 'GENERAL' OR txn.type <> 'DEBIT' LIMIT 1;`,
	);
	const allocations = await database.getAllAsync<ExpenseAllocationRow>(
		`SELECT txn.id, txn.amount, item.amount AS itemAmount
		 FROM transactions txn
		 LEFT JOIN transaction_items item ON item.transaction_id = txn.id
		 WHERE txn.classification = 'GENERAL' AND txn.type = 'DEBIT';`,
	);
	const totals = new Map<string, ExpenseAllocationTotal>();
	for (const allocation of allocations) {
		const total = totals.get(allocation.id) ?? {
			amount: allocation.amount,
			allocated: ZERO_AMOUNT,
		};
		total.allocated = addMoney(
			total.allocated,
			allocation.itemAmount ?? ZERO_AMOUNT,
		);
		totals.set(allocation.id, total);
	}
	if (
		invalidParent ||
		[...totals.values()].some(
			(total) => compareMoney(total.amount, total.allocated) !== 0,
		)
	) {
		throw new AppError(
			"TRANSACTION_ITEMS_INVALID",
			"Expense items do not match their payments. Your data was not migrated.",
		);
	}
};

const migrateDatabase = async (database: SQLiteDatabase): Promise<void> => {
	const versionRow = await database.getFirstAsync<DatabaseVersionRow>(
		"PRAGMA user_version;",
	);
	const version = versionRow?.user_version ?? 0;
	if (version > DATABASE_VERSION || version < 0) {
		throw new AppError(
			"DATABASE_VERSION_UNSUPPORTED",
			"This database requires a newer version of Purplecoins.",
		);
	}
	await database.execAsync(
		"PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;",
	);
	if (version < 1) {
		await database.withTransactionAsync(async () => {
			const columns = await database.getAllAsync<
				Pick<SimpleEntity, "name">
			>("PRAGMA table_info(investments);");
			if (columns.length > 0) {
				if (!columns.some((column) => column.name === "label")) {
					await database.execAsync(
						"ALTER TABLE investments ADD COLUMN label TEXT;",
					);
				}
				if (
					!columns.some(
						(column) => column.name === "investment_type_id",
					)
				) {
					await database.execAsync(
						"ALTER TABLE investments ADD COLUMN investment_type_id TEXT REFERENCES investment_types(id) ON DELETE SET NULL;",
					);
				}
			}
			await database.execAsync(SCHEMA_SQL);
			await validateDatabase(database);
			await database.execAsync("PRAGMA user_version = 1;");
		});
	}
	if (version < 2) {
		await database.execAsync("PRAGMA foreign_keys = OFF;");
		try {
			await database.withTransactionAsync(async () => {
				await database.execAsync(ITEMS_SQL);
				const expenses =
					await database.getAllAsync<LegacyExpenseRow>(`SELECT id, category_id, amount, created_at, updated_at FROM transactions txn
					WHERE classification = 'GENERAL' AND type = 'DEBIT'
					AND NOT EXISTS (SELECT 1 FROM transaction_items item WHERE item.transaction_id = txn.id);`);
				for (const expense of expenses) {
					await database.runAsync(
						`INSERT INTO transaction_items (id, transaction_id, category_id, amount, position, created_at, updated_at)
						 VALUES (?, ?, ?, ?, 0, ?, ?);`,
						createId(),
						expense.id,
						expense.category_id,
						expense.amount,
						expense.created_at,
						expense.updated_at,
					);
				}
				await validateExpenseItems(database);
				await database.execAsync(REBUILD_TRANSACTIONS_SQL);
				await database.execAsync(SCHEMA_SQL);
				await validateDatabase(database);
				await database.execAsync("PRAGMA user_version = 2;");
			});
		} finally {
			await database.execAsync("PRAGMA foreign_keys = ON;");
		}
	}
	await validateDatabase(database);
	await validateExpenseItems(database);
};

export default migrateDatabase;
