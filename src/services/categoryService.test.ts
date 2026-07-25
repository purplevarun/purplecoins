import categoryService from "@/services/categoryService";

import { beforeEach, describe, expect, it } from "vitest";

import financeRepository from "@/repositories/financeRepository";
import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	deleteCategory,
	getArchivedCategories,
	getCategories,
	getCategory,
	saveCategory,
	setCategoryArchived,
} = categoryService;
const { insertCategory, insertSource } = dbFixtures;
const { createTransactionRow, upsertBudgetRow } = financeRepository;

const NOW = 1_780_000_000_000;

describe("categoryService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("saveCategory (create)", () => {
		it("creates a category and coerces isIncome/archived to booleans", async () => {
			const id = await saveCategory(database, undefined, "Salary", true);

			const category = await getCategory(database, id);
			expect(category?.name).toBe("Salary");
			expect(category?.isIncome).toBe(true);
			expect(category?.archived).toBe(false);
		});

		it("throws CATEGORY_NAME_REQUIRED for a blank name", async () => {
			await expect(
				saveCategory(database, undefined, "   ", false),
			).rejects.toMatchObject({ code: "CATEGORY_NAME_REQUIRED" });
		});

		it("throws CATEGORY_NAME_DUPLICATE case-insensitively", async () => {
			await saveCategory(database, undefined, "Rent", false);

			await expect(
				saveCategory(database, undefined, "rent", false),
			).rejects.toMatchObject({ code: "CATEGORY_NAME_DUPLICATE" });
		});

		it("trims the provided name", async () => {
			const id = await saveCategory(
				database,
				undefined,
				"  Food  ",
				false,
			);
			expect((await getCategory(database, id))?.name).toBe("Food");
		});
	});

	describe("saveCategory (update)", () => {
		it("updates name/isIncome while preserving createdAt and archived state", async () => {
			const existing = await insertCategory(database, {
				name: "Old",
				isIncome: false,
				archived: false,
				createdAt: 1000,
			});

			await saveCategory(database, existing.id, "New", true);

			const updated = await getCategory(database, existing.id);
			expect(updated?.name).toBe("New");
			expect(updated?.isIncome).toBe(true);
			expect(updated?.createdAt).toBe(1000);
		});

		it("allows keeping the same name (case-different) when updating", async () => {
			const existing = await insertCategory(database, { name: "Rent" });

			await expect(
				saveCategory(database, existing.id, "RENT", false),
			).resolves.toBe(existing.id);
		});

		it("does not treat an archived category's name as a collision", async () => {
			const archived = await insertCategory(database, {
				name: "Rent",
				archived: true,
			});
			const id = await saveCategory(database, undefined, "Rent", false);

			expect(id).not.toBe(archived.id);
		});
	});

	describe("listing", () => {
		it("separates active from archived categories", async () => {
			const active = await insertCategory(database, { name: "Active" });
			const archived = await insertCategory(database, {
				name: "Archived",
			});
			await setCategoryArchived(database, archived.id, true);

			expect(
				(await getCategories(database)).map((row) => row.id),
			).toEqual([active.id]);
			expect(
				(await getArchivedCategories(database)).map((row) => row.id),
			).toEqual([archived.id]);
		});

		it("restores an archived category back to the active list", async () => {
			const category = await insertCategory(database, {
				archived: true,
			});

			await setCategoryArchived(database, category.id, false);

			expect(
				(await getCategories(database)).map((row) => row.id),
			).toEqual([category.id]);
			expect(await getArchivedCategories(database)).toEqual([]);
		});
	});

	describe("deleteCategory", () => {
		it("deletes an unused category", async () => {
			const category = await insertCategory(database);
			await deleteCategory(database, category.id);
			expect(await getCategory(database, category.id)).toBeNull();
		});

		it("maps a foreign-key violation from a transaction to CATEGORY_IN_USE", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				{
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: source.id,
					amount: "10",
					categoryId: category.id,
					reason: "x",
					transactionAt: NOW,
				},
				"txn-1",
				NOW,
			);

			await expect(
				deleteCategory(database, category.id),
			).rejects.toMatchObject({ code: "CATEGORY_IN_USE" });
		});

		it("maps a foreign-key violation from a budget to CATEGORY_IN_USE", async () => {
			const category = await insertCategory(database);
			await upsertBudgetRow(database, {
				id: "budget-1",
				categoryId: category.id,
				categoryName: category.name,
				amount: "100",
				period: "MONTHLY",
				createdAt: NOW,
				updatedAt: NOW,
			});

			await expect(
				deleteCategory(database, category.id),
			).rejects.toMatchObject({ code: "CATEGORY_IN_USE" });
		});

		it("rethrows an unrelated database error unchanged (not misclassified as CATEGORY_IN_USE)", async () => {
			const category = await insertCategory(database);
			await database.closeAsync();

			const rejection = await deleteCategory(database, category.id).then(
				() => null,
				(error: unknown) => error,
			);

			expect(rejection).not.toMatchObject({ code: "CATEGORY_IN_USE" });
			expect((rejection as Error).message).not.toContain("FOREIGN KEY");
		});
	});
});
