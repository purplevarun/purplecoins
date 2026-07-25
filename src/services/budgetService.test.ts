import budgetService from "@/services/budgetService";

import { beforeEach, describe, expect, it } from "vitest";

import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const { deleteBudget, getBudget, getBudgets, saveBudget } = budgetService;
const { insertCategory } = dbFixtures;

describe("budgetService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("saveBudget (create)", () => {
		it("creates a budget with a normalized amount", async () => {
			const category = await insertCategory(database, {
				name: "Rent",
			});

			const id = await saveBudget(
				database,
				undefined,
				category.id,
				"20000.00",
				"MONTHLY",
			);

			const budget = await getBudget(database, id);
			expect(budget?.amount).toBe("20000");
			expect(budget?.categoryName).toBe("Rent");
			expect(budget?.period).toBe("MONTHLY");
		});

		it("throws BUDGET_CATEGORY_REQUIRED when categoryId is empty", async () => {
			await expect(
				saveBudget(database, undefined, "", "100", "MONTHLY"),
			).rejects.toMatchObject({ code: "BUDGET_CATEGORY_REQUIRED" });
		});

		it("throws INVALID_AMOUNT for a non-numeric amount", async () => {
			const category = await insertCategory(database);
			await expect(
				saveBudget(database, undefined, category.id, "abc", "MONTHLY"),
			).rejects.toMatchObject({ code: "INVALID_AMOUNT" });
		});

		it("throws DUPLICATE_BUDGET for the same category/period pair", async () => {
			const category = await insertCategory(database);
			await saveBudget(
				database,
				undefined,
				category.id,
				"100",
				"MONTHLY",
			);

			await expect(
				saveBudget(database, undefined, category.id, "200", "MONTHLY"),
			).rejects.toMatchObject({ code: "DUPLICATE_BUDGET" });
		});

		it("allows the same category with a different period", async () => {
			const category = await insertCategory(database);
			await saveBudget(
				database,
				undefined,
				category.id,
				"100",
				"MONTHLY",
			);

			await expect(
				saveBudget(database, undefined, category.id, "1200", "YEARLY"),
			).resolves.toEqual(expect.any(String));
		});
	});

	describe("saveBudget (update)", () => {
		it("preserves createdAt and categoryName when updating the amount", async () => {
			const category = await insertCategory(database, {
				name: "Groceries",
			});
			const id = await saveBudget(
				database,
				undefined,
				category.id,
				"100",
				"MONTHLY",
			);
			const original = await getBudget(database, id);

			await saveBudget(database, id, category.id, "150", "MONTHLY");

			const updated = await getBudget(database, id);
			expect(updated?.amount).toBe("150");
			expect(updated?.createdAt).toBe(original?.createdAt);
			expect(updated?.categoryName).toBe("Groceries");
		});

		it("does not conflict with its own existing (category, period) row", async () => {
			const category = await insertCategory(database);
			const id = await saveBudget(
				database,
				undefined,
				category.id,
				"100",
				"MONTHLY",
			);

			await expect(
				saveBudget(database, id, category.id, "999", "MONTHLY"),
			).resolves.toBe(id);
		});
	});

	describe("getBudgets / deleteBudget", () => {
		it("lists all budgets", async () => {
			const category = await insertCategory(database);
			await saveBudget(
				database,
				undefined,
				category.id,
				"100",
				"MONTHLY",
			);

			expect(await getBudgets(database)).toHaveLength(1);
		});

		it("deletes a budget", async () => {
			const category = await insertCategory(database);
			const id = await saveBudget(
				database,
				undefined,
				category.id,
				"100",
				"MONTHLY",
			);

			await deleteBudget(database, id);

			expect(await getBudget(database, id)).toBeNull();
		});
	});
});
