import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getInvestmentTypeRows: vi.fn(async () => []),
	investmentTypeNameExistsRow: vi.fn(async () => false),
	upsertInvestmentTypeRow: vi.fn(async () => {}),
	createId: vi.fn(() => "type-id"),
}));

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		getInvestmentTypeRows: mocks.getInvestmentTypeRows,
		investmentTypeNameExistsRow: mocks.investmentTypeNameExistsRow,
		upsertInvestmentTypeRow: mocks.upsertInvestmentTypeRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import investmentTypeService from "@/services/investmentTypeService";

const database = {} as any;

describe("investmentTypeService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("returns investment type rows", async () => {
		mocks.getInvestmentTypeRows.mockResolvedValueOnce([
			{ id: "t1", name: "Mutual Fund" },
		]);
		expect(
			await investmentTypeService.getInvestmentTypes(database),
		).toEqual([{ id: "t1", name: "Mutual Fund" }]);
	});

	it("validates and saves an investment type", async () => {
		await expect(
			investmentTypeService.saveInvestmentType(database, "   "),
		).rejects.toMatchObject<AppError>({
			code: "INVESTMENT_TYPE_NAME_REQUIRED",
		});

		mocks.investmentTypeNameExistsRow.mockResolvedValueOnce(true);
		await expect(
			investmentTypeService.saveInvestmentType(database, "Mutual Fund"),
		).rejects.toMatchObject<AppError>({
			code: "INVESTMENT_TYPE_NAME_DUPLICATE",
		});

		mocks.investmentTypeNameExistsRow.mockResolvedValueOnce(false);
		const id = await investmentTypeService.saveInvestmentType(
			database,
			"  Mutual Fund  ",
		);
		expect(id).toBe("type-id");
		expect(mocks.upsertInvestmentTypeRow).toHaveBeenCalledWith(database, {
			id: "type-id",
			name: "Mutual Fund",
			createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			updatedAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
		});
	});
});
