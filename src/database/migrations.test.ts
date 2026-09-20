import SCHEMA_SQL from "@/database/schema";
import createDatabase from "@/test/sqliteTestDatabase";
import type { DatabaseSync } from "node:sqlite";
import { describe, expect, it, vi } from "vitest";

import migrateDatabase from "@/database/migrations";

const seedLegacy = (sqlite: DatabaseSync): void => {
	sqlite.exec(SCHEMA_SQL);
	sqlite.exec("DROP TABLE transaction_items;");
	sqlite.exec(`
		INSERT INTO sources VALUES ('source', 'Bank', 'INR', NULL, NULL, 1, 2);
		INSERT INTO categories VALUES ('food', 'Food', 0, NULL, 1, 2);
		INSERT INTO trips VALUES ('trip', 'Holiday', NULL, 1, 2);
		INSERT INTO transactions VALUES ('expense', 'GENERAL', 'DEBIT', 'source', NULL, '200.10', NULL, 'food', 'trip', NULL, 'Supermart', 100, 1, 2);
		INSERT INTO attachments VALUES ('receipt', 'TRANSACTION', 'expense', 'receipt.txt', 'text/plain', 3, x'616263', 1, 2);
	`);
};

describe("migrations", () => {
	it("creates a new database and runs idempotent SQL every time", async () => {
		const { sqlite, database } = createDatabase();
		const execAsync = vi.spyOn(database, "execAsync");
		await migrateDatabase(database);
		await migrateDatabase(database);
		expect(sqlite.prepare("SELECT * FROM transaction_items").all()).toEqual(
			[],
		);
		expect(execAsync.mock.calls.flat().join(" ")).not.toContain("PRAGMA");
	});

	it("backfills an existing expense once without changing its payment or receipt", async () => {
		const { sqlite, database } = createDatabase();
		seedLegacy(sqlite);
		const payment = sqlite.prepare("SELECT * FROM transactions").get();
		const receipt = sqlite.prepare("SELECT * FROM attachments").get();
		await migrateDatabase(database);
		const items = sqlite.prepare("SELECT * FROM transaction_items").all();
		expect(items).toHaveLength(1);
		expect(items[0]).toMatchObject({
			transaction_id: "expense",
			category_id: "food",
			amount: "200.10",
			position: 0,
		});
		expect(sqlite.prepare("SELECT * FROM transactions").get()).toEqual(
			payment,
		);
		expect(sqlite.prepare("SELECT * FROM attachments").get()).toEqual(
			receipt,
		);
		await migrateDatabase(database);
		expect(sqlite.prepare("SELECT * FROM transaction_items").all()).toEqual(
			items,
		);
	});

	it.each(["", ", label TEXT", ", investment_type_id TEXT"])(
		"adds missing legacy investment columns: %s",
		async (extraColumns) => {
			const { sqlite, database } = createDatabase();
			sqlite.exec(
				`CREATE TABLE investments (id TEXT PRIMARY KEY, name TEXT, archived INTEGER, created_at INTEGER, updated_at INTEGER ${extraColumns});`,
			);
			await migrateDatabase(database);
			expect(
				sqlite
					.prepare(
						"SELECT label, investment_type_id FROM investments",
					)
					.all(),
			).toEqual([]);
		},
	);

	it("propagates unexpected migration failures", async () => {
		const { sqlite, database } = createDatabase();
		vi.spyOn(database, "execAsync").mockImplementation(
			async (sql: string) => {
				sqlite.exec(sql);
				if (sql.includes("INSERT INTO transaction_items")) {
					throw new Error("interrupted");
				}
			},
		);
		await expect(migrateDatabase(database)).rejects.toThrow("interrupted");
	});

	it("propagates unexpected legacy column migration failures", async () => {
		const { database } = createDatabase();
		vi.spyOn(database, "execAsync").mockRejectedValueOnce(
			new Error("database unavailable"),
		);
		await expect(migrateDatabase(database)).rejects.toThrow(
			"database unavailable",
		);
	});
});
