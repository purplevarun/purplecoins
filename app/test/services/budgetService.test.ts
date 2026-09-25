import type TestAsyncFunction from "@test/types/TestAsyncFunction";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteBudgetRow: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
	getBudgetRow: vi.fn<TestAsyncFunction>().mockResolvedValue(null),
	getBudgetRows: vi.fn<TestAsyncFunction>().mockResolvedValue([]),
	upsertBudgetRow: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
	createId: vi.fn(() => "budget-id"),
}));

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		deleteBudgetRow: mocks.deleteBudgetRow,
		getBudgetRow: mocks.getBudgetRow,
		getBudgetRows: mocks.getBudgetRows,
		upsertBudgetRow: mocks.upsertBudgetRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import budgetService from "@/services/budgetService";

const database = {} as any;

describe("budgetService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("gets budgets and one budget", async () => {
		mocks.getBudgetRows.mockResolvedValueOnce([{ id: "b1" }]);
		mocks.getBudgetRow.mockResolvedValueOnce({ id: "b2" });

		expect(await budgetService.getBudgets(database)).toEqual([
			{ id: "b1" },
		]);
		expect(await budgetService.getBudget(database, "b2")).toEqual({
			id: "b2",
		});
	});

	it("requires categoryId", async () => {
		await expect(
			budgetService.saveBudget(database, undefined, "", "100", "MONTHLY"),
		).rejects.toMatchObject({ code: "BUDGET_CATEGORY_REQUIRED" });
	});

	it("creates new budget and normalizes amount", async () => {
		const id = await budgetService.saveBudget(
			database,
			undefined,
			"cat1",
			"00123.4500",
			"MONTHLY",
		);
		expect(id).toBe("budget-id");
		expect(mocks.upsertBudgetRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "budget-id",
				categoryId: "cat1",
				amount: "123.45",
				period: "MONTHLY",
				createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
				categoryName: "",
			}),
		);
	});

	it("updates existing budget preserving fields", async () => {
		mocks.getBudgetRow.mockResolvedValueOnce({
			id: "b1",
			categoryName: "Rent",
			createdAt: 101,
		});

		const id = await budgetService.saveBudget(
			database,
			"b1",
			"cat2",
			"100",
			"YEARLY",
		);
		expect(id).toBe("b1");
		expect(mocks.upsertBudgetRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "b1",
				categoryId: "cat2",
				categoryName: "Rent",
				createdAt: 101,
				period: "YEARLY",
			}),
		);
	});

	it("maps duplicate constraint errors", async () => {
		mocks.upsertBudgetRow.mockRejectedValueOnce(
			new Error("UNIQUE constraint failed"),
		);
		await expect(
			budgetService.saveBudget(
				database,
				undefined,
				"cat1",
				"100",
				"MONTHLY",
			),
		).rejects.toMatchObject({ code: "DUPLICATE_BUDGET" });
	});

	it("rethrows unknown upsert errors and deletes budget", async () => {
		mocks.upsertBudgetRow.mockRejectedValueOnce(new Error("disk"));
		await expect(
			budgetService.saveBudget(
				database,
				undefined,
				"cat1",
				"100",
				"MONTHLY",
			),
		).rejects.toThrow("disk");

		await budgetService.deleteBudget(database, "b1");
		expect(mocks.deleteBudgetRow).toHaveBeenCalledWith(database, "b1");
	});
});
