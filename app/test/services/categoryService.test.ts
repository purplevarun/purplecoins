import type TestAsyncFunction from "@test/types/TestAsyncFunction";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	return {
		categoryInUseRow: vi.fn(async () => false),
		categoryNameExistsRow: vi.fn(async () => false),
		deleteCategoryRow: vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined),
		getArchivedCategoryRows: vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue([]),
		getCategoryRow: vi.fn<TestAsyncFunction>().mockResolvedValue(null),
		getCategoryRows: vi.fn<TestAsyncFunction>().mockResolvedValue([]),
		setCategoryArchivedRow: vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined),
		upsertCategoryRow: vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined),
		createId: vi.fn(() => "category-id"),
	};
});

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		categoryInUseRow: mocks.categoryInUseRow,
		categoryNameExistsRow: mocks.categoryNameExistsRow,
		deleteCategoryRow: mocks.deleteCategoryRow,
		getArchivedCategoryRows: mocks.getArchivedCategoryRows,
		getCategoryRow: mocks.getCategoryRow,
		getCategoryRows: mocks.getCategoryRows,
		setCategoryArchivedRow: mocks.setCategoryArchivedRow,
		upsertCategoryRow: mocks.upsertCategoryRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import categoryService from "@/services/categoryService";

const database = {} as any;

describe("categoryService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => {
			if (typeof mockFn === "function" && "mockClear" in mockFn) {
				mockFn.mockClear();
			}
		});
	});

	it("maps boolean fields in category getters", async () => {
		mocks.getCategoryRows.mockResolvedValueOnce([
			{
				id: "c1",
				name: "Rent",
				kind: "EXPENSE",
				isIncome: 0,
				archived: 1,
			},
		]);
		mocks.getArchivedCategoryRows.mockResolvedValueOnce([
			{
				id: "c2",
				name: "Salary",
				kind: "INCOME",
				isIncome: 1,
				archived: 0,
			},
		]);
		mocks.getCategoryRow.mockResolvedValueOnce({
			id: "c1",
			name: "Rent",
			kind: "EXPENSE",
			isIncome: 0,
			archived: 1,
		});
		mocks.getCategoryRow.mockResolvedValueOnce(null);

		expect(await categoryService.getCategories(database)).toEqual([
			expect.objectContaining({
				kind: "EXPENSE",
				isIncome: false,
				archived: true,
			}),
		]);
		expect(await categoryService.getArchivedCategories(database)).toEqual([
			expect.objectContaining({
				kind: "INCOME",
				isIncome: true,
				archived: false,
			}),
		]);
		expect(await categoryService.getCategory(database, "c1")).toEqual(
			expect.objectContaining({ isIncome: false, archived: true }),
		);
		expect(
			await categoryService.getCategory(database, "missing"),
		).toBeNull();
	});

	it("derives isIncome from kind and passes the kind filter through", async () => {
		mocks.getCategoryRows.mockResolvedValueOnce([
			{
				id: "c3",
				name: "Lent",
				kind: "REFUND",
				isIncome: 0,
				archived: 0,
			},
		]);
		const categories = await categoryService.getCategories(
			database,
			"REFUND",
		);
		expect(mocks.getCategoryRows).toHaveBeenCalledWith(database, "REFUND");
		expect(categories).toEqual([
			expect.objectContaining({ kind: "REFUND", isIncome: false }),
		]);
	});

	it("validates saveCategory", async () => {
		await expect(
			categoryService.saveCategory(database, undefined, "   ", "EXPENSE"),
		).rejects.toMatchObject({
			code: "CATEGORY_NAME_REQUIRED",
		});

		mocks.categoryNameExistsRow.mockResolvedValueOnce(true);
		await expect(
			categoryService.saveCategory(
				database,
				undefined,
				"Rent",
				"EXPENSE",
			),
		).rejects.toMatchObject({
			code: "CATEGORY_NAME_DUPLICATE",
		});
	});

	it("creates category and updates category preserving fields", async () => {
		mocks.categoryNameExistsRow.mockResolvedValueOnce(false);
		const createdId = await categoryService.saveCategory(
			database,
			undefined,
			"  Rent  ",
			"EXPENSE",
		);
		expect(createdId).toBe("category-id");
		expect(mocks.upsertCategoryRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "category-id",
				name: "Rent",
				kind: "EXPENSE",
				isIncome: false,
				createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
				updatedAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
				archived: false,
			}),
		);

		mocks.categoryNameExistsRow.mockResolvedValueOnce(false);
		mocks.getCategoryRow.mockResolvedValueOnce({
			id: "c1",
			name: "Old",
			kind: "EXPENSE",
			isIncome: 0,
			archived: true,
			createdAt: 123,
			updatedAt: 456,
		});
		const updatedId = await categoryService.saveCategory(
			database,
			"c1",
			"  New  ",
			"INCOME",
		);
		expect(updatedId).toBe("c1");
		expect(mocks.upsertCategoryRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "c1",
				name: "New",
				kind: "INCOME",
				isIncome: true,
				createdAt: 123,
				archived: true,
			}),
		);
	});

	it("archives and deletes category", async () => {
		await categoryService.setCategoryArchived(database, "c1", true);
		expect(mocks.setCategoryArchivedRow).toHaveBeenCalledWith(
			database,
			"c1",
			true,
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);

		await categoryService.deleteCategory(database, "c1");
		expect(mocks.deleteCategoryRow).toHaveBeenCalledWith(database, "c1");
	});

	it("rejects deleting a category that is in use", async () => {
		mocks.categoryInUseRow.mockResolvedValueOnce(true);
		await expect(
			categoryService.deleteCategory(database, "c1"),
		).rejects.toMatchObject({ code: "CATEGORY_IN_USE" });
		expect(mocks.deleteCategoryRow).not.toHaveBeenCalled();
	});
});
