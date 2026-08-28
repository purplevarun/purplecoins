import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	return {
		categoryNameExistsRow: vi.fn(async () => false),
		deleteCategoryRow: vi.fn(async () => {}),
		getArchivedCategoryRows: vi.fn(async () => []),
		getCategoryRow: vi.fn(async () => null),
		getCategoryRows: vi.fn(async () => []),
		setCategoryArchivedRow: vi.fn(async () => {}),
		upsertCategoryRow: vi.fn(async () => {}),
		createId: vi.fn(() => "category-id"),
	};
});

vi.mock("@/repositories/financeRepository", () => ({
	default: {
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
			{ id: "c1", name: "Rent", isIncome: 0, archived: 1 },
		]);
		mocks.getArchivedCategoryRows.mockResolvedValueOnce([
			{ id: "c2", name: "Salary", isIncome: 1, archived: 0 },
		]);
		mocks.getCategoryRow.mockResolvedValueOnce({
			id: "c1",
			name: "Rent",
			isIncome: 0,
			archived: 1,
		});
		mocks.getCategoryRow.mockResolvedValueOnce(null);

		expect(await categoryService.getCategories(database)).toEqual([
			expect.objectContaining({ isIncome: false, archived: true }),
		]);
		expect(await categoryService.getArchivedCategories(database)).toEqual([
			expect.objectContaining({ isIncome: true, archived: false }),
		]);
		expect(await categoryService.getCategory(database, "c1")).toEqual(
			expect.objectContaining({ isIncome: false, archived: true }),
		);
		expect(
			await categoryService.getCategory(database, "missing"),
		).toBeNull();
	});

	it("validates saveCategory", async () => {
		await expect(
			categoryService.saveCategory(database, undefined, "   ", false),
		).rejects.toMatchObject<AppError>({
			code: "CATEGORY_NAME_REQUIRED",
		});

		mocks.categoryNameExistsRow.mockResolvedValueOnce(true);
		await expect(
			categoryService.saveCategory(database, undefined, "Rent", false),
		).rejects.toMatchObject<AppError>({
			code: "CATEGORY_NAME_DUPLICATE",
		});
	});

	it("creates category and updates category preserving fields", async () => {
		mocks.categoryNameExistsRow.mockResolvedValueOnce(false);
		const createdId = await categoryService.saveCategory(
			database,
			undefined,
			"  Rent  ",
			false,
		);
		expect(createdId).toBe("category-id");
		expect(mocks.upsertCategoryRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "category-id",
				name: "Rent",
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
			isIncome: 0,
			archived: true,
			createdAt: 123,
			updatedAt: 456,
		});
		const updatedId = await categoryService.saveCategory(
			database,
			"c1",
			"  New  ",
			true,
		);
		expect(updatedId).toBe("c1");
		expect(mocks.upsertCategoryRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "c1",
				name: "New",
				isIncome: true,
				createdAt: 123,
				archived: true,
			}),
		);
	});

	it("archives category and handles delete errors", async () => {
		await categoryService.setCategoryArchived(database, "c1", true);
		expect(mocks.setCategoryArchivedRow).toHaveBeenCalledWith(
			database,
			"c1",
			true,
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);

		mocks.deleteCategoryRow.mockRejectedValueOnce(
			new Error("FOREIGN KEY failed"),
		);
		await expect(
			categoryService.deleteCategory(database, "c1"),
		).rejects.toMatchObject<AppError>({
			code: "CATEGORY_IN_USE",
		});

		mocks.deleteCategoryRow.mockRejectedValueOnce(new Error("other"));
		await expect(
			categoryService.deleteCategory(database, "c1"),
		).rejects.toThrow("other");
	});
});
