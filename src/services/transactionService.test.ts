import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	return {
		createTransactionRow: vi.fn(async () => {}),
		deleteTransactionRow: vi.fn(async () => {}),
		getSourceRow: vi.fn(async () => null),
		getTransactionRow: vi.fn(async () => null),
		getTransactionRows: vi.fn(async () => []),
		updateTransactionRow: vi.fn(async () => {}),
		createId: vi.fn(() => "new-transaction-id"),
	};
});

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		createTransactionRow: mocks.createTransactionRow,
		deleteTransactionRow: mocks.deleteTransactionRow,
		getSourceRow: mocks.getSourceRow,
		getTransactionRow: mocks.getTransactionRow,
		getTransactionRows: mocks.getTransactionRows,
		updateTransactionRow: mocks.updateTransactionRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import transactionService from "@/services/transactionService";

const database = {} as any;

describe("transactionService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => {
			if (typeof mockFn === "function" && "mockClear" in mockFn) {
				mockFn.mockClear();
			}
		});
	});

	it("maps hasAttachment in getTransactions and getTransaction", async () => {
		mocks.getTransactionRows.mockResolvedValueOnce([
			{
				id: "t1",
				sourceId: "s1",
				destinationSourceId: null,
				categoryId: null,
				tripId: null,
				investmentId: null,
				classification: "GENERAL",
				type: "DEBIT",
				amount: "10",
				toAmount: null,
				reason: "x",
				createdAt: 1,
				updatedAt: 1,
				transactionAt: 1,
				sourceName: "A",
				sourceCurrencyCode: "INR",
				destinationSourceName: null,
				destinationCurrencyCode: null,
				categoryName: null,
				tripName: null,
				investmentName: null,
				hasAttachment: 1,
			},
		]);
		mocks.getTransactionRow.mockResolvedValueOnce({
			id: "t2",
			sourceId: "s1",
			destinationSourceId: null,
			categoryId: null,
			tripId: null,
			investmentId: null,
			classification: "GENERAL",
			type: "DEBIT",
			amount: "10",
			toAmount: null,
			reason: "x",
			createdAt: 1,
			updatedAt: 1,
			transactionAt: 1,
			sourceName: "A",
			sourceCurrencyCode: "INR",
			destinationSourceName: null,
			destinationCurrencyCode: null,
			categoryName: null,
			tripName: null,
			investmentName: null,
			hasAttachment: 0,
		});

		const list = await transactionService.getTransactions(database);
		expect(list[0]?.hasAttachment).toBe(true);

		const one = await transactionService.getTransaction(database, "t2");
		expect(one?.hasAttachment).toBe(false);
		expect(await transactionService.getTransaction(database, "missing")).toBeNull();
	});

	it("filters linked transactions by kind", async () => {
		mocks.getTransactionRows.mockResolvedValue([
			{ id: "a", sourceId: "s1", destinationSourceId: "s2", categoryId: "c1", tripId: "tr1", investmentId: "i1", hasAttachment: 0 },
			{ id: "b", sourceId: "s3", destinationSourceId: null, categoryId: "c2", tripId: "tr2", investmentId: "i2", hasAttachment: 1 },
		]);

		expect(
			(await transactionService.getLinkedTransactions(database, {
				kind: "SOURCE",
				entityId: "s2",
			})).map((transaction) => transaction.id),
		).toEqual(["a"]);
		expect(
			(await transactionService.getLinkedTransactions(database, {
				kind: "CATEGORY",
				entityId: "c2",
			})).map((transaction) => transaction.id),
		).toEqual(["b"]);
		expect(
			(await transactionService.getLinkedTransactions(database, {
				kind: "TRIP",
				entityId: "tr1",
			})).map((transaction) => transaction.id),
		).toEqual(["a"]);
		expect(
			(await transactionService.getLinkedTransactions(database, {
				kind: "INVESTMENT",
				entityId: "i2",
			})).map((transaction) => transaction.id),
		).toEqual(["b"]);
	});

	it("requires sourceId in saveTransaction", async () => {
		await expect(
			transactionService.saveTransaction(database, {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: "",
				amount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject<AppError>({ code: "SOURCE_REQUIRED" });
	});

	it("validates non-transfer categories", async () => {
		await expect(
			transactionService.saveTransaction(database, {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: "s1",
				amount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject<AppError>({ code: "CATEGORY_REQUIRED" });
	});

		it("requires a non-empty reason for non-transfer transactions", async () => {
			await expect(
				transactionService.saveTransaction(database, {
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: "s1",
					categoryId: "c1",
					amount: "10",
					reason: "   ",
				}),
			).rejects.toMatchObject<AppError>({
				code: "TRANSACTION_REASON_REQUIRED",
			});
		});

	it("validates investment inputs", async () => {
		await expect(
			transactionService.saveTransaction(database, {
				classification: "INVESTMENT",
				type: "DEBIT",
				sourceId: "s1",
				amount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject<AppError>({ code: "INVESTMENT_REQUIRED" });

		const id = await transactionService.saveTransaction(database, {
			classification: "INVESTMENT",
			type: "TRANSFER",
			sourceId: "s1",
			investmentId: "inv1",
			amount: "10.00",
			reason: "  invest  ",
		});
		expect(id).toBe("new-transaction-id");
		expect(mocks.createTransactionRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				classification: "INVESTMENT",
				type: "DEBIT",
				categoryId: undefined,
				tripId: undefined,
				destinationSourceId: undefined,
				toAmount: undefined,
				reason: "invest",
			}),
			"new-transaction-id",
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);
	});

	it("validates transfer destination rules", async () => {
		await expect(
			transactionService.saveTransaction(database, {
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: "s1",
				amount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject<AppError>({ code: "DESTINATION_REQUIRED" });

		await expect(
			transactionService.saveTransaction(database, {
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: "s1",
				destinationSourceId: "s1",
				amount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject<AppError>({ code: "SAME_TRANSFER_SOURCE" });
	});

	it("handles cross-currency transfer by normalizing toAmount", async () => {
		mocks.getSourceRow.mockResolvedValueOnce({ id: "s1", currencyCode: "INR" });
		mocks.getSourceRow.mockResolvedValueOnce({ id: "s2", currencyCode: "USD" });

		await transactionService.saveTransaction(database, {
			classification: "GENERAL",
			type: "TRANSFER",
			sourceId: "s1",
			destinationSourceId: "s2",
			amount: "100",
			toAmount: " 1.25 ",
			reason: " move ",
		});

		expect(mocks.createTransactionRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				classification: "GENERAL",
				amount: "100",
				toAmount: "1.25",
				reason: "move",
				categoryId: undefined,
				tripId: undefined,
				investmentId: undefined,
			}),
			expect.any(String),
			expect.any(Number),
		);
	});

	it("rejects missing transfer sources and same-currency mismatch", async () => {
		mocks.getSourceRow.mockResolvedValueOnce(null);
		mocks.getSourceRow.mockResolvedValueOnce({ id: "s2", currencyCode: "INR" });
		await expect(
			transactionService.saveTransaction(database, {
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: "s1",
				destinationSourceId: "s2",
				amount: "10",
				toAmount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject<AppError>({ code: "SOURCE_NOT_FOUND" });

		mocks.getSourceRow.mockResolvedValueOnce({ id: "s1", currencyCode: "INR" });
		mocks.getSourceRow.mockResolvedValueOnce({ id: "s2", currencyCode: "INR" });
		await transactionService.saveTransaction(database, {
			classification: "GENERAL",
			type: "TRANSFER",
			sourceId: "s1",
			destinationSourceId: "s2",
			amount: "10",
			toAmount: "12",
			reason: "ok",
		});
		expect(mocks.createTransactionRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({ toAmount: "10" }),
			expect.any(String),
			expect.any(Number),
		);
	});

	it("updates existing transaction when id is provided", async () => {
		await transactionService.saveTransaction(database, {
			id: "existing",
			classification: "GENERAL",
			type: "DEBIT",
			sourceId: "s1",
			categoryId: "c1",
			amount: "10",
			reason: "ok",
		});

		expect(mocks.updateTransactionRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({ categoryId: "c1", investmentId: undefined }),
			"existing",
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);
		expect(mocks.createTransactionRow).not.toHaveBeenCalled();
	});

	it("deletes transaction and builds display reason", async () => {
		await transactionService.deleteTransaction(database, "t1");
		expect(mocks.deleteTransactionRow).toHaveBeenCalledWith(database, "t1");

		expect(
			transactionService.getTransactionDisplayReason({
				reason: "  custom  ",
				type: "DEBIT",
				sourceName: "A",
				destinationSourceName: "B",
			} as any),
		).toBe("  custom  ");
		expect(
			transactionService.getTransactionDisplayReason({
				reason: " ",
				type: "TRANSFER",
				sourceName: "A",
				destinationSourceName: "B",
			} as any),
		).toBe("A to B");
		expect(
			transactionService.getTransactionDisplayReason({
				reason: " ",
				type: "DEBIT",
				sourceName: "A",
				destinationSourceName: null,
			} as any),
		).toBe("Transaction");
	});
});
