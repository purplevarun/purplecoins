import SCHEMA_MIGRATIONS, {
	isIdempotentMigrationError,
} from "@/database/migrations";
import SCHEMA_SQL from "@/database/schema";
import createTestDatabase from "@test/helpers/sqliteTestDatabase";
import { describe, expect, it } from "vitest";

describe("category kind migration", () => {
	it("backfills kind, drops is_income, and tolerates a repeated run", async () => {
		const { database, sqlite } = createTestDatabase();
		await database.execAsync(SCHEMA_SQL);
		sqlite.exec(`
			INSERT INTO categories (id, name, is_income, created_at, updated_at)
			VALUES ('rent', 'Rent', 0, 1, 1), ('salary', 'Salary', 1, 1, 1);
		`);
		for (const migration of SCHEMA_MIGRATIONS) {
			await database.execAsync(migration);
		}
		expect(
			sqlite.prepare("SELECT id, kind FROM categories ORDER BY id").all(),
		).toEqual([
			{ id: "rent", kind: "EXPENSE" },
			{ id: "salary", kind: "INCOME" },
		]);
		expect(
			sqlite
				.prepare("SELECT name FROM pragma_table_info('categories')")
				.all()
				.map((row) => (row as { name: string }).name),
		).not.toContain("is_income");

		for (const migration of SCHEMA_MIGRATIONS) {
			try {
				await database.execAsync(migration);
			} catch (error) {
				if (!isIdempotentMigrationError(error)) {
					throw error;
				}
			}
		}
		expect(
			sqlite
				.prepare("SELECT kind FROM categories WHERE id = 'rent'")
				.get(),
		).toEqual({ kind: "EXPENSE" });
	});
});
