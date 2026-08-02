import categoryService from "@/services/categoryService";

import { beforeEach, describe, expect, it } from "vitest";

import financeRepository from "@/repositories/financeRepository";
import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	deleteCategory,
	getArchivedCategories,
	mergeCategories,
	getCategories,
	getCategoryMergeImpact,
	getCategory,
	saveCategory,
	setCategoryArchived,
} = categoryService;
const { insertCategory, insertSource } = dbFixtures;
const {
	createTransactionRow,
	getBudgetRows,
	getTransactionRows,
	upsertBudgetRow,
} = financeRepository;

const NOW = 1_780_000_000_000;

describe("categoryService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("saveCategory (create)", () => {
		it("creates a category and coerces archived to boolean", async () => {
			const id = await saveCategory(
				database,
				undefined,
				"Salary",
				"INCOME",
			);

			const category = await getCategory(database, id);
			expect(category?.name).toBe("Salary");
			expect(category?.type).toBe("INCOME");
			expect(category?.archived).toBe(false);
		});

		it("throws CATEGORY_NAME_REQUIRED for a blank name", async () => {
			await expect(
				saveCategory(database, undefined, "   ", "EXPENSE"),
			).rejects.toMatchObject({ code: "CATEGORY_NAME_REQUIRED" });
		});

		it("throws CATEGORY_TYPE_INVALID for an invalid type", async () => {
			await expect(
				saveCategory(database, undefined, "Bad", "BOGUS" as never),
			).rejects.toMatchObject({ code: "CATEGORY_TYPE_INVALID" });
		});

		it("creates a REFUND category", async () => {
			const id = await saveCategory(
				database,
				undefined,
				"Lent",
				"REFUND",
			);

			const category = await getCategory(database, id);
			expect(category?.type).toBe("REFUND");
		});

		it("throws CATEGORY_NAME_DUPLICATE case-insensitively", async () => {
			await saveCategory(database, undefined, "Rent", "EXPENSE");

			await expect(
				saveCategory(database, undefined, "rent", "EXPENSE"),
			).rejects.toMatchObject({ code: "CATEGORY_NAME_DUPLICATE" });
		});

		it("trims the provided name", async () => {
			const id = await saveCategory(
				database,
				undefined,
				"  Food  ",
				"EXPENSE",
			);
			expect((await getCategory(database, id))?.name).toBe("Food");
		});
	});

	describe("saveCategory (update)", () => {
		it("updates name/type while preserving createdAt and archived state", async () => {
			const existing = await insertCategory(database, {
				name: "Old",
				type: "EXPENSE",
				archived: false,
				createdAt: 1000,
			});

			await saveCategory(database, existing.id, "New", "INCOME");

			const updated = await getCategory(database, existing.id);
			expect(updated?.name).toBe("New");
			expect(updated?.type).toBe("INCOME");
			expect(updated?.createdAt).toBe(1000);
		});

		it("allows keeping the same name (case-different) when updating", async () => {
			const existing = await insertCategory(database, { name: "Rent" });

			await expect(
				saveCategory(database, existing.id, "RENT", "EXPENSE"),
			).resolves.toBe(existing.id);
		});

		it("does not treat an archived category's name as a collision", async () => {
			const archived = await insertCategory(database, {
				name: "Rent",
				archived: true,
			});
			const id = await saveCategory(
				database,
				undefined,
				"Rent",
				"EXPENSE",
			);

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

	describe("mergeCategories", () => {
		it("creates a new category, moves linked transactions and deletes both old categories", async () => {
			const source = await insertSource(database);
			const groceries = await insertCategory(database, {
				name: "Groceries",
			});
			const vegetables = await insertCategory(database, {
				name: "Vegetables",
			});
			await createTransactionRow(
				database,
				{
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: source.id,
					amount: "25",
					categoryId: groceries.id,
					reason: "Weekly groceries",
					transactionAt: NOW,
				},
				"txn-merge-1",
				NOW,
			);
			await createTransactionRow(
				database,
				{
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: source.id,
					amount: "12",
					categoryId: vegetables.id,
					reason: "Veggies",
					transactionAt: NOW + 1,
				},
				"txn-merge-2",
				NOW,
			);

			const mergedId = await mergeCategories(
				database,
				groceries.id,
				vegetables.id,
				"Food",
			);

			expect(await getCategory(database, groceries.id)).toBeNull();
			expect(await getCategory(database, vegetables.id)).toBeNull();
			expect(await getCategory(database, mergedId)).toMatchObject({
				name: "Food",
				type: "EXPENSE",
			});

			const transactions = await getTransactionRows(database);
			expect(
				transactions.map((transaction) => transaction.categoryId),
			).toEqual([mergedId, mergedId]);
			expect(
				new Set(
					transactions.map((transaction) => transaction.categoryName),
				),
			).toEqual(new Set(["Food"]));
		});

		it("combines monthly and yearly budgets when both source categories have them", async () => {
			const rent = await insertCategory(database, { name: "Rent" });
			const utilities = await insertCategory(database, {
				name: "Utilities",
			});
			await upsertBudgetRow(database, {
				id: "budget-rent-monthly",
				categoryId: rent.id,
				categoryName: rent.name,
				amount: "1000",
				period: "MONTHLY",
				createdAt: NOW,
				updatedAt: NOW,
			});
			await upsertBudgetRow(database, {
				id: "budget-utilities-monthly",
				categoryId: utilities.id,
				categoryName: utilities.name,
				amount: "250",
				period: "MONTHLY",
				createdAt: NOW + 1,
				updatedAt: NOW + 1,
			});
			await upsertBudgetRow(database, {
				id: "budget-utilities-yearly",
				categoryId: utilities.id,
				categoryName: utilities.name,
				amount: "1200",
				period: "YEARLY",
				createdAt: NOW + 2,
				updatedAt: NOW + 2,
			});

			const mergedId = await mergeCategories(
				database,
				rent.id,
				utilities.id,
				"Housing",
			);

			const budgets = await getBudgetRows(database);
			expect(budgets).toHaveLength(2);
			expect(budgets).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						categoryId: mergedId,
						categoryName: "Housing",
						period: "MONTHLY",
						amount: "1250",
					}),
					expect.objectContaining({
						categoryId: mergedId,
						categoryName: "Housing",
						period: "YEARLY",
						amount: "1200",
					}),
				]),
			);
		});

		it("allows reusing one of the source category names for the merged category", async () => {
			const groceries = await insertCategory(database, {
				name: "Groceries",
			});
			const vegetables = await insertCategory(database, {
				name: "Vegetables",
			});

			const mergedId = await mergeCategories(
				database,
				groceries.id,
				vegetables.id,
				"Groceries",
			);

			expect(await getCategory(database, mergedId)).toMatchObject({
				name: "Groceries",
			});
		});

		it("rejects selecting the same category twice", async () => {
			const groceries = await insertCategory(database, {
				name: "Groceries",
			});

			await expect(
				mergeCategories(database, groceries.id, groceries.id, "Food"),
			).rejects.toMatchObject({
				code: "CATEGORY_MERGE_SELECTION_INVALID",
			});
		});

		it("rejects a blank merged category name", async () => {
			const groceries = await insertCategory(database, {
				name: "Groceries",
			});
			const vegetables = await insertCategory(database, {
				name: "Vegetables",
			});

			await expect(
				mergeCategories(database, groceries.id, vegetables.id, "   "),
			).rejects.toMatchObject({ code: "CATEGORY_NAME_REQUIRED" });
		});

		it("rejects merging when a selected category no longer exists", async () => {
			const groceries = await insertCategory(database, {
				name: "Groceries",
			});

			await expect(
				mergeCategories(
					database,
					groceries.id,
					"missing-category-id",
					"Food",
				),
			).rejects.toMatchObject({ code: "CATEGORY_NOT_FOUND" });
		});

		it("rejects mixing income and expense categories", async () => {
			const income = await insertCategory(database, {
				name: "Salary",
				type: "INCOME",
			});
			const expense = await insertCategory(database, {
				name: "Groceries",
				type: "EXPENSE",
			});

			await expect(
				mergeCategories(database, income.id, expense.id, "Merged"),
			).rejects.toMatchObject({ code: "CATEGORY_MERGE_TYPE_MISMATCH" });
		});

		it("rejects a merged name that already belongs to a third active category", async () => {
			const groceries = await insertCategory(database, {
				name: "Groceries",
			});
			const vegetables = await insertCategory(database, {
				name: "Vegetables",
			});
			await insertCategory(database, { name: "Food" });

			await expect(
				mergeCategories(database, groceries.id, vegetables.id, "Food"),
			).rejects.toMatchObject({ code: "CATEGORY_NAME_DUPLICATE" });
		});
	});

	describe("getCategoryMergeImpact", () => {
		it("counts linked transactions and budgets for both selected categories", async () => {
			const source = await insertSource(database);
			const first = await insertCategory(database, { name: "A" });
			const second = await insertCategory(database, { name: "B" });
			const third = await insertCategory(database, { name: "C" });

			await createTransactionRow(
				database,
				{
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: source.id,
					amount: "10",
					categoryId: first.id,
					reason: "a",
					transactionAt: NOW,
				},
				"txn-impact-1",
				NOW,
			);
			await createTransactionRow(
				database,
				{
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: source.id,
					amount: "20",
					categoryId: second.id,
					reason: "b",
					transactionAt: NOW + 1,
				},
				"txn-impact-2",
				NOW,
			);
			await createTransactionRow(
				database,
				{
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: source.id,
					amount: "30",
					categoryId: third.id,
					reason: "c",
					transactionAt: NOW + 2,
				},
				"txn-impact-3",
				NOW,
			);

			await upsertBudgetRow(database, {
				id: "budget-impact-1",
				categoryId: first.id,
				categoryName: first.name,
				amount: "100",
				period: "MONTHLY",
				createdAt: NOW,
				updatedAt: NOW,
			});
			await upsertBudgetRow(database, {
				id: "budget-impact-2",
				categoryId: second.id,
				categoryName: second.name,
				amount: "200",
				period: "YEARLY",
				createdAt: NOW,
				updatedAt: NOW,
			});
			await upsertBudgetRow(database, {
				id: "budget-impact-3",
				categoryId: third.id,
				categoryName: third.name,
				amount: "300",
				period: "MONTHLY",
				createdAt: NOW,
				updatedAt: NOW,
			});

			await expect(
				getCategoryMergeImpact(database, first.id, second.id),
			).resolves.toEqual({
				transactionCount: 2,
				budgetCount: 2,
			});
		});

		it("returns zero counts for invalid selections", async () => {
			const first = await insertCategory(database, { name: "A" });

			expect(
				await getCategoryMergeImpact(database, first.id, first.id),
			).toEqual({
				transactionCount: 0,
				budgetCount: 0,
			});
		});
	});
});
