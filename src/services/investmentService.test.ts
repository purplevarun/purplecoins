import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteSimpleEntityRow: vi.fn(async () => {}),
	getArchivedInvestmentRows: vi.fn(async () => []),
	getInvestmentRow: vi.fn(async () => null),
	getInvestmentRows: vi.fn(async () => []),
	setSimpleEntityArchivedRow: vi.fn(async () => {}),
	simpleEntityNameExistsRow: vi.fn(async () => false),
	upsertSimpleEntityRow: vi.fn(async () => {}),
	createId: vi.fn(() => "investment-id"),
}));

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		deleteSimpleEntityRow: mocks.deleteSimpleEntityRow,
		getArchivedInvestmentRows: mocks.getArchivedInvestmentRows,
		getInvestmentRow: mocks.getInvestmentRow,
		getInvestmentRows: mocks.getInvestmentRows,
		setSimpleEntityArchivedRow: mocks.setSimpleEntityArchivedRow,
		simpleEntityNameExistsRow: mocks.simpleEntityNameExistsRow,
		upsertSimpleEntityRow: mocks.upsertSimpleEntityRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import investmentService from "@/services/investmentService";

const database = {} as any;

describe("investmentService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("maps archived values in getters", async () => {
		mocks.getInvestmentRows.mockResolvedValueOnce([{ id: "i1", name: "A", archived: 1 }]);
		mocks.getArchivedInvestmentRows.mockResolvedValueOnce([{ id: "i2", name: "B", archived: 0 }]);
		mocks.getInvestmentRow.mockResolvedValueOnce({ id: "i1", name: "A", archived: 1 });
		mocks.getInvestmentRow.mockResolvedValueOnce(null);

		expect((await investmentService.getInvestments(database))[0]?.archived).toBe(true);
		expect((await investmentService.getArchivedInvestments(database))[0]?.archived).toBe(false);
		expect((await investmentService.getInvestment(database, "i1"))?.archived).toBe(true);
		expect(await investmentService.getInvestment(database, "missing")).toBeNull();
	});

	it("validates and saves investment", async () => {
		await expect(investmentService.saveInvestment(database, undefined, "   ")).rejects.toMatchObject<AppError>({
			code: "INVESTMENT_NAME_REQUIRED",
		});

		mocks.simpleEntityNameExistsRow.mockResolvedValueOnce(true);
		await expect(investmentService.saveInvestment(database, undefined, "Fund A")).rejects.toMatchObject<AppError>({
			code: "INVESTMENT_NAME_DUPLICATE",
		});

		mocks.simpleEntityNameExistsRow.mockResolvedValueOnce(false);
		const createdId = await investmentService.saveInvestment(database, undefined, "  Fund A  ");
		expect(createdId).toBe("investment-id");
		expect(mocks.upsertSimpleEntityRow).toHaveBeenCalledWith(
			database,
			"investments",
			expect.objectContaining({
				id: "investment-id",
				name: "Fund A",
				createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			}),
		);

		mocks.simpleEntityNameExistsRow.mockResolvedValueOnce(false);
		mocks.getInvestmentRow.mockResolvedValueOnce({ id: "i1", name: "old", createdAt: 10 });
		const updatedId = await investmentService.saveInvestment(database, "i1", "  Fund B ");
		expect(updatedId).toBe("i1");
		expect(mocks.upsertSimpleEntityRow).toHaveBeenCalledWith(
			database,
			"investments",
			expect.objectContaining({ id: "i1", name: "Fund B", createdAt: 10 }),
		);
	});

	it("archives and deletes investment with fk error mapping", async () => {
		await investmentService.setInvestmentArchived(database, "i1", true);
		expect(mocks.setSimpleEntityArchivedRow).toHaveBeenCalledWith(
			database,
			"investments",
			"i1",
			true,
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);

		mocks.deleteSimpleEntityRow.mockRejectedValueOnce(new Error("FOREIGN KEY failed"));
		await expect(investmentService.deleteInvestment(database, "i1")).rejects.toMatchObject<AppError>({
			code: "INVESTMENT_IN_USE",
		});

		mocks.deleteSimpleEntityRow.mockRejectedValueOnce(new Error("disk"));
		await expect(investmentService.deleteInvestment(database, "i1")).rejects.toThrow("disk");
	});
});
