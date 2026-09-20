import SCHEMA_SQL from "@/database/schema";
import createDatabase from "@/test/sqliteTestDatabase";
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/utils/id", () => ({ default: () => randomUUID() }));

import migrateDatabase from "@/database/migrations";

const seedLegacy = (sqlite: DatabaseSync): void => {
	sqlite.exec(SCHEMA_SQL);
	sqlite.exec(`
		INSERT INTO sources VALUES ('source', 'Bank', 'INR', NULL, NULL, 1, 2);
		INSERT INTO sources VALUES ('destination', 'Cash', 'INR', NULL, NULL, 1, 2);
		INSERT INTO categories VALUES ('food', 'Food', 0, NULL, 1, 2);
		INSERT INTO categories VALUES ('salary', 'Salary', 1, NULL, 1, 2);
		INSERT INTO trips VALUES ('trip', 'Holiday', NULL, 1, 2);
		INSERT INTO investments VALUES ('investment', 'Fund', NULL, NULL, NULL, 1, 2);
		INSERT INTO transactions VALUES ('expense', 'GENERAL', 'DEBIT', 'source', NULL, '200.10', NULL, 'food', 'trip', NULL, 'Supermart', 100, 1, 2);
		INSERT INTO transactions VALUES ('income', 'GENERAL', 'CREDIT', 'source', NULL, '500', NULL, 'salary', NULL, NULL, 'Salary', 100, 1, 2);
		INSERT INTO transactions VALUES ('transfer', 'GENERAL', 'TRANSFER', 'source', 'destination', '50', '50', NULL, NULL, NULL, '', 100, 1, 2);
		INSERT INTO transactions VALUES ('invest', 'INVESTMENT', 'DEBIT', 'source', NULL, '20', NULL, NULL, NULL, 'investment', 'Fund', 100, 1, 2);
		INSERT INTO attachments VALUES ('receipt', 'TRANSACTION', 'expense', 'receipt.txt', 'text/plain', 3, x'616263', 1, 2);
	`);
};

describe("migrations", () => {
	it("initializes a new database and is safe to run again", async () => {
		const { sqlite, database } = createDatabase();
		await migrateDatabase(database);
		await migrateDatabase(database);
		expect(sqlite.prepare("PRAGMA user_version").get()).toEqual({
			user_version: 2,
		});
		expect(sqlite.prepare("PRAGMA foreign_keys").get()).toEqual({
			foreign_keys: 1,
		});
		expect(sqlite.prepare("SELECT * FROM transaction_items").all()).toEqual(
			[],
		);
	});

	it("preserves existing payments and receipts and backfills an expense only once", async () => {
		const { sqlite, database } = createDatabase();
		seedLegacy(sqlite);
		const original = sqlite
			.prepare("SELECT * FROM transactions ORDER BY id")
			.all();
		const receipts = sqlite.prepare("SELECT * FROM attachments").all();
		await migrateDatabase(database);
		const items = sqlite.prepare("SELECT * FROM transaction_items").all();
		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({
			transaction_id: "expense",
			category_id: "food",
			amount: "200.10",
			position: 0,
			created_at: 1,
			updated_at: 2,
		});
		expect(items[0]?.id).toMatch(/^[a-f0-9-]{36}$/);
		expect(
			sqlite.prepare("SELECT * FROM transactions ORDER BY id").all(),
		).toEqual(
			original.map((row) =>
				row.id === "expense" ? { ...row, category_id: null } : row,
			),
		);
		expect(sqlite.prepare("SELECT * FROM attachments").all()).toEqual(
			receipts,
		);
		await migrateDatabase(database);
		expect(sqlite.prepare("SELECT * FROM transaction_items").all()).toEqual(
			items,
		);
		expect(sqlite.prepare("PRAGMA foreign_key_check").all()).toEqual([]);
		expect(() =>
			sqlite.exec("DELETE FROM categories WHERE id = 'food'"),
		).toThrow();
		sqlite.exec("DELETE FROM transactions WHERE id = 'expense'");
		expect(sqlite.prepare("SELECT * FROM transaction_items").all()).toEqual(
			[],
		);
	});

	it.each(["", ", label TEXT", ", investment_type_id TEXT"])(
		"adds missing legacy investment columns before indexes: %s",
		async (extraColumns) => {
			const { sqlite, database } = createDatabase();
			sqlite.exec(`CREATE TABLE investments (id TEXT PRIMARY KEY, name TEXT, archived INTEGER, created_at INTEGER, updated_at INTEGER ${extraColumns});
		INSERT INTO investments (id, name, created_at, updated_at) VALUES ('old', 'Fund', 1, 2);`);
			await migrateDatabase(database);
			expect(
				sqlite
					.prepare(
						"SELECT name, label, investment_type_id FROM investments",
					)
					.get(),
			).toEqual({ name: "Fund", label: null, investment_type_id: null });
		},
	);

	it("rolls back a failed rebuild without losing payments, allocations or receipts", async () => {
		const { sqlite, database } = createDatabase();
		seedLegacy(sqlite);
		const original = sqlite.prepare("SELECT * FROM transactions").all();
		vi.spyOn(database, "execAsync").mockImplementation(async (sql) => {
			sqlite.exec(sql);
			if (sql.includes("DROP TABLE transactions;"))
				throw new Error("interrupted");
		});
		await expect(migrateDatabase(database)).rejects.toThrow("interrupted");
		expect(sqlite.prepare("SELECT * FROM transactions").all()).toEqual(
			original,
		);
		expect(
			sqlite
				.prepare(
					"SELECT name FROM sqlite_master WHERE name = 'transaction_items'",
				)
				.all(),
		).toEqual([]);
		expect(sqlite.prepare("SELECT id FROM attachments").all()).toEqual([
			{ id: "receipt" },
		]);
		expect(sqlite.prepare("PRAGMA user_version").get()).toEqual({
			user_version: 1,
		});
		expect(sqlite.prepare("PRAGMA foreign_keys").get()).toEqual({
			foreign_keys: 1,
		});
	});

	it.each([-1, 99])(
		"refuses unsupported version %i before changing anything",
		async (version) => {
			const { sqlite, database } = createDatabase();
			const execAsync = vi.spyOn(database, "execAsync");
			sqlite.exec(`PRAGMA user_version = ${version};`);
			await expect(migrateDatabase(database)).rejects.toThrow(
				"newer version",
			);
			expect(execAsync).not.toHaveBeenCalled();
		},
	);

	it("handles a missing legacy version row and refuses failed integrity checks", async () => {
		const { database } = createDatabase();
		vi.spyOn(database, "getFirstAsync").mockResolvedValueOnce(null);
		await migrateDatabase(database);
		vi.spyOn(database, "getFirstAsync")
			.mockResolvedValueOnce({ user_version: 2 })
			.mockResolvedValueOnce(null);
		await expect(migrateDatabase(database)).rejects.toThrow(
			"validation failed",
		);
	});

	it.each(["missing", "mismatch", "wrong parent"])(
		"rejects %s expense allocations without rewriting payments",
		async (failure) => {
			const { sqlite, database } = createDatabase();
			seedLegacy(sqlite);
			await migrateDatabase(database);
			if (failure === "missing")
				sqlite.exec("DELETE FROM transaction_items;");
			else if (failure === "mismatch")
				sqlite.exec("UPDATE transaction_items SET amount = '1';");
			else
				sqlite.exec(
					"UPDATE transaction_items SET transaction_id = 'income';",
				);
			const original = sqlite
				.prepare("SELECT * FROM transactions ORDER BY id")
				.all();
			await expect(migrateDatabase(database)).rejects.toThrow(
				"Expense items do not match",
			);
			expect(
				sqlite.prepare("SELECT * FROM transactions ORDER BY id").all(),
			).toEqual(original);
		},
	);

	it("rejects broken foreign keys without converting the original rows", async () => {
		const { sqlite, database } = createDatabase();
		seedLegacy(sqlite);
		sqlite.exec(
			"PRAGMA foreign_keys = OFF; UPDATE transactions SET source_id = 'missing' WHERE id = 'expense';",
		);
		await expect(migrateDatabase(database)).rejects.toThrow(
			"validation failed",
		);
		expect(
			sqlite
				.prepare(
					"SELECT category_id FROM transactions WHERE id = 'expense'",
				)
				.get(),
		).toEqual({ category_id: "food" });
	});
});
