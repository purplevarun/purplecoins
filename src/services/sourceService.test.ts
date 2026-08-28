import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	return {
		createSourceRow: vi.fn(async () => {}),
		deleteSourceRow: vi.fn(async () => {}),
		getArchivedSourceRows: vi.fn(async () => []),
		getSourceRow: vi.fn(async () => null),
		getSourceRows: vi.fn(async () => []),
		getTransactionRows: vi.fn(async () => []),
		setSourceArchivedRow: vi.fn(async () => {}),
		sourceNameExistsRow: vi.fn(async () => false),
		updateSourceNameRow: vi.fn(async () => {}),
		validateSourceRow: vi.fn(async () => {}),
		createId: vi.fn(() => "source-id"),
	};
});

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		createSourceRow: mocks.createSourceRow,
		deleteSourceRow: mocks.deleteSourceRow,
		getArchivedSourceRows: mocks.getArchivedSourceRows,
		getSourceRow: mocks.getSourceRow,
		getSourceRows: mocks.getSourceRows,
		getTransactionRows: mocks.getTransactionRows,
		setSourceArchivedRow: mocks.setSourceArchivedRow,
		sourceNameExistsRow: mocks.sourceNameExistsRow,
		updateSourceNameRow: mocks.updateSourceNameRow,
		validateSourceRow: mocks.validateSourceRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import sourceService from "@/services/sourceService";

const database = {} as any;

describe("sourceService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => {
			if (typeof mockFn === "function" && "mockClear" in mockFn) {
				mockFn.mockClear();
			}
		});
	});

	it("builds balances for credit, debit, and transfer in getSources", async () => {
		mocks.getSourceRows.mockResolvedValueOnce([
			{ id: "s1", name: "A", currencyCode: "INR", archived: 0 },
			{ id: "s2", name: "B", currencyCode: "USD", archived: 1 },
		]);
		mocks.getTransactionRows.mockResolvedValueOnce([
			{ type: "CREDIT", sourceId: "s1", amount: "100" },
			{ type: "DEBIT", sourceId: "s1", amount: "40" },
			{
				type: "TRANSFER",
				sourceId: "s1",
				amount: "10",
				destinationSourceId: "s2",
				toAmount: "8",
			},
		]);

		const sources = await sourceService.getSources(database);
		expect(sources).toEqual([
			expect.objectContaining({
				id: "s1",
				archived: false,
				balance: "50",
			}),
			expect.objectContaining({ id: "s2", archived: true, balance: "8" }),
		]);
	});

	it("gets archived sources with balances", async () => {
		mocks.getArchivedSourceRows.mockResolvedValueOnce([
			{ id: "s1", name: "A", currencyCode: "INR", archived: 1 },
		]);
		mocks.getTransactionRows.mockResolvedValueOnce([]);

		const sources = await sourceService.getArchivedSources(database);
		expect(sources[0]).toEqual(
			expect.objectContaining({ archived: true, balance: "0" }),
		);
	});

	it("returns source or null", async () => {
		mocks.getSourceRow.mockResolvedValueOnce(null);
		expect(await sourceService.getSource(database, "x")).toBeNull();

		mocks.getSourceRow.mockResolvedValueOnce({
			id: "s1",
			name: "A",
			currencyCode: "INR",
			archived: 0,
		});
		expect(await sourceService.getSource(database, "s1")).toEqual(
			expect.objectContaining({ archived: false }),
		);
	});

	it("validates createSource input", async () => {
		await expect(
			sourceService.createSource(database, "   ", "INR"),
		).rejects.toMatchObject<AppError>({
			code: "SOURCE_NAME_REQUIRED",
		});

		mocks.sourceNameExistsRow.mockResolvedValueOnce(true);
		await expect(
			sourceService.createSource(database, "Cash", "INR"),
		).rejects.toMatchObject<AppError>({
			code: "SOURCE_NAME_DUPLICATE",
		});

		mocks.sourceNameExistsRow.mockResolvedValueOnce(false);
		await expect(
			sourceService.createSource(database, "Cash", "i9r"),
		).rejects.toMatchObject<AppError>({
			code: "INVALID_CURRENCY",
		});
	});

	it("creates source with normalized values", async () => {
		mocks.sourceNameExistsRow.mockResolvedValueOnce(false);
		const id = await sourceService.createSource(
			database,
			"  Cash  ",
			" inr ",
		);
		expect(id).toBe("source-id");
		expect(mocks.createSourceRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "source-id",
				name: "Cash",
				currencyCode: "INR",
				balance: "0",
				archived: false,
			}),
		);
	});

	it("validates and updates source name", async () => {
		await expect(
			sourceService.updateSourceName(database, "s1", "   "),
		).rejects.toMatchObject<AppError>({
			code: "SOURCE_NAME_REQUIRED",
		});

		mocks.sourceNameExistsRow.mockResolvedValueOnce(true);
		await expect(
			sourceService.updateSourceName(database, "s1", "Cash"),
		).rejects.toMatchObject<AppError>({
			code: "SOURCE_NAME_DUPLICATE",
		});

		mocks.sourceNameExistsRow.mockResolvedValueOnce(false);
		await sourceService.updateSourceName(database, "s1", "  Wallet  ");
		expect(mocks.updateSourceNameRow).toHaveBeenCalledWith(
			database,
			"s1",
			"Wallet",
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);
	});

	it("validates and archives source", async () => {
		await sourceService.validateSource(database, "s1");
		expect(mocks.validateSourceRow).toHaveBeenCalledWith(
			database,
			"s1",
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);

		await sourceService.setSourceArchived(database, "s1", true);
		expect(mocks.setSourceArchivedRow).toHaveBeenCalledWith(
			database,
			"s1",
			true,
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);
	});

	it("maps foreign-key delete errors", async () => {
		mocks.deleteSourceRow.mockRejectedValueOnce(
			new Error("FOREIGN KEY constraint failed"),
		);
		await expect(
			sourceService.deleteSource(database, "s1"),
		).rejects.toMatchObject<AppError>({
			code: "SOURCE_IN_USE",
		});
	});

	it("rethrows non-foreign-key delete errors", async () => {
		mocks.deleteSourceRow.mockRejectedValueOnce(new Error("disk issue"));
		await expect(
			sourceService.deleteSource(database, "s1"),
		).rejects.toThrow("disk issue");
	});
});
