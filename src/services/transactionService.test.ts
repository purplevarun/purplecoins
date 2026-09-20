import type TestAsyncFunction from "@/types/testing/TestAsyncFunction";
import type Transaction from "@/types/Transaction";
import type TransactionCursor from "@/types/TransactionCursor";
import type { SQLiteDatabase } from "expo-sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	return {
		createTransactionRow: vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined),
		createTransactionItemRow: vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined),
		deleteTransactionItemRows: vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined),
		saveAttachment: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
		deleteAttachment: vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined),
		deleteTransactionRow: vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined),
		getCategoryRow: vi.fn<TestAsyncFunction>().mockResolvedValue(null),
		getSourceRow: vi.fn<TestAsyncFunction>().mockResolvedValue(null),
		getTransactionPageRows: vi
			.fn<
				(
					database: SQLiteDatabase,
					limit: number,
					cursor?: TransactionCursor,
				) => Promise<readonly Transaction[]>
			>()
			.mockResolvedValue([]),
		getTransactionRow: vi.fn<TestAsyncFunction>().mockResolvedValue(null),
		getTransactionRows: vi.fn<TestAsyncFunction>().mockResolvedValue([]),
		updateTransactionRow: vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined),
		createId: vi.fn(() => "new-transaction-id"),
	};
});

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		createTransactionRow: mocks.createTransactionRow,
		createTransactionItemRow: mocks.createTransactionItemRow,
		deleteTransactionItemRows: mocks.deleteTransactionItemRows,
		deleteTransactionRow: mocks.deleteTransactionRow,
		getCategoryRow: mocks.getCategoryRow,
		getSourceRow: mocks.getSourceRow,
		getTransactionPageRows: mocks.getTransactionPageRows,
		getTransactionRow: mocks.getTransactionRow,
		getTransactionRows: mocks.getTransactionRows,
		updateTransactionRow: mocks.updateTransactionRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

vi.mock("@/services/attachmentService", () => ({
	default: {
		saveAttachment: mocks.saveAttachment,
		deleteAttachment: mocks.deleteAttachment,
	},
}));

import transactionService from "@/services/transactionService";

const database = {
	withTransactionAsync: async (callback: () => Promise<void>) => callback(),
} as SQLiteDatabase;

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

	it("queries only the requested day without paging metadata", async () => {
		mocks.getTransactionRows.mockResolvedValueOnce([]);

		expect(
			await transactionService.getTransactions(database, {
				start: 100,
				end: 200,
			}),
		).toEqual([]);
		expect(mocks.getTransactionRows).toHaveBeenCalledWith(
			database,
			100,
			200,
		);
		expect(mocks.getTransactionPageRows).not.toHaveBeenCalled();
	});

	it.each([0, 1, 9, 10, 11])(
		"returns at most ten transactions from %i rows and checks for another page",
		async (count) => {
			const rows: readonly Transaction[] = Array.from(
				{ length: count },
				(_, index) => ({
					id: `00000000-0000-4000-8000-${String(11 - index).padStart(12, "0")}`,
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: "00000000-0000-4000-8000-000000000100",
					destinationSourceId: null,
					amount: "10",
					toAmount: null,
					categoryId: "00000000-0000-4000-8000-000000000101",
					tripId: null,
					investmentId: null,
					reason: "Expense",
					transactionAt: new Date(2020 + index, 0, 1).getTime(),
					createdAt: 100,
					updatedAt: 100,
					sourceName: "Cash",
					sourceCurrencyCode: "INR",
					destinationSourceName: null,
					destinationCurrencyCode: null,
					categoryName: "Food",
					tripName: null,
					investmentName: null,
					hasAttachment: index % 2 === 0,
					items: [],
				}),
			);
			mocks.getTransactionPageRows.mockResolvedValueOnce(rows);

			expect(
				await transactionService.getTransactionPage(database),
			).toEqual({ transactions: rows.slice(0, 10), hasMore: count > 10 });
			expect(
				mocks.getTransactionPageRows,
			).toHaveBeenCalledExactlyOnceWith(database, 11, undefined);
			expect(mocks.getTransactionRows).not.toHaveBeenCalled();
		},
	);

	it("forwards both creation timestamp and ID when fetching the next ten", async () => {
		const cursor = {
			createdAt: 0,
			id: "00000000-0000-4000-8000-000000000010",
		};
		mocks.getTransactionPageRows.mockResolvedValueOnce([]);

		expect(
			await transactionService.getTransactionPage(database, cursor),
		).toEqual({ transactions: [], hasMore: false });
		expect(mocks.getTransactionPageRows).toHaveBeenCalledExactlyOnceWith(
			database,
			11,
			cursor,
		);
	});

	it("propagates a failed page query", async () => {
		mocks.getTransactionPageRows.mockRejectedValueOnce(
			new Error("page failed"),
		);

		await expect(
			transactionService.getTransactionPage(database),
		).rejects.toThrow("page failed");
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
		expect(
			await transactionService.getTransaction(database, "missing"),
		).toBeNull();
	});

	it("filters linked transactions by kind", async () => {
		mocks.getTransactionRows.mockResolvedValue([
			{
				id: "a",
				sourceId: "s1",
				destinationSourceId: "s2",
				categoryId: "c1",
				tripId: "tr1",
				investmentId: "i1",
				hasAttachment: 0,
				items: [],
			},
			{
				id: "b",
				sourceId: "s3",
				destinationSourceId: null,
				categoryId: "c2",
				tripId: "tr2",
				investmentId: "i2",
				hasAttachment: 1,
			},
		]);

		expect(
			(
				await transactionService.getLinkedTransactions(database, {
					kind: "SOURCE",
					entityId: "s2",
				})
			).map((transaction) => transaction.id),
		).toEqual(["a"]);
		expect(
			(
				await transactionService.getLinkedTransactions(database, {
					kind: "CATEGORY",
					entityId: "c2",
				})
			).map((transaction) => transaction.id),
		).toEqual(["b"]);
		expect(
			(
				await transactionService.getLinkedTransactions(database, {
					kind: "TRIP",
					entityId: "tr1",
				})
			).map((transaction) => transaction.id),
		).toEqual(["a"]);
		expect(
			(
				await transactionService.getLinkedTransactions(database, {
					kind: "INVESTMENT",
					entityId: "i2",
				})
			).map((transaction) => transaction.id),
		).toEqual(["b"]);
	});

	it("requires sourceId in saveTransaction", async () => {
		await expect(
			transactionService.saveTransaction(database, {
				transactionAt: 1,
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: "",
				amount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject({ code: "SOURCE_REQUIRED" });
	});

	it("validates non-transfer categories", async () => {
		await expect(
			transactionService.saveTransaction(database, {
				transactionAt: 1,
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: "s1",
				amount: "10",
				reason: "ok",
				items: [{ categoryId: "", amount: "10" }],
			}),
		).rejects.toMatchObject({ code: "CATEGORY_REQUIRED" });
	});

	it("defaults a blank non-transfer reason to the category name", async () => {
		mocks.getCategoryRow.mockResolvedValueOnce({
			id: "c1",
			name: "Groceries",
			isIncome: false,
			createdAt: 1,
			updatedAt: 1,
			archived: false,
		});

		const id = await transactionService.saveTransaction(database, {
			classification: "GENERAL",
			type: "DEBIT",
			sourceId: "s1",
			categoryId: "c1",
			amount: "10",
			reason: "   ",
			transactionAt: 1,
			items: [{ categoryId: "c1", amount: "10" }],
		});

		expect(id).toBe("new-transaction-id");
		expect(mocks.getCategoryRow).toHaveBeenCalledWith(database, "c1");
		expect(mocks.createTransactionRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				reason: "Groceries",
			}),
			"new-transaction-id",
			expect.any(Number),
		);
	});

	it("fails when a blank non-transfer reason has no matching category", async () => {
		mocks.getCategoryRow.mockResolvedValueOnce(null);

		await expect(
			transactionService.saveTransaction(database, {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: "s1",
				categoryId: "missing-category",
				amount: "10",
				reason: "   ",
				transactionAt: 1,
				items: [{ categoryId: "missing-category", amount: "10" }],
			}),
		).rejects.toMatchObject({ code: "CATEGORY_NOT_FOUND" });
	});

	it("validates investment inputs", async () => {
		await expect(
			transactionService.saveTransaction(database, {
				transactionAt: 1,
				classification: "INVESTMENT",
				type: "DEBIT",
				sourceId: "s1",
				amount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject({ code: "INVESTMENT_REQUIRED" });

		await expect(
			transactionService.saveTransaction(database, {
				classification: "INVESTMENT",
				type: "DEBIT",
				sourceId: "s1",
				investmentId: "inv1",
				amount: "10",
				reason: "   ",
				transactionAt: 1,
			}),
		).rejects.toMatchObject({
			code: "TRANSACTION_REASON_REQUIRED",
		});

		const id = await transactionService.saveTransaction(database, {
			transactionAt: 1,
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

		await transactionService.saveTransaction(database, {
			transactionAt: 1,
			classification: "INVESTMENT",
			type: "CREDIT",
			sourceId: "s1",
			investmentId: "inv2",
			amount: "11",
			reason: " interest ",
		});
		expect(mocks.createTransactionRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				classification: "INVESTMENT",
				type: "CREDIT",
				reason: "interest",
			}),
			expect.any(String),
			expect.any(Number),
		);
	});

	it("validates transfer destination rules", async () => {
		await expect(
			transactionService.saveTransaction(database, {
				transactionAt: 1,
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: "s1",
				amount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject({ code: "DESTINATION_REQUIRED" });

		await expect(
			transactionService.saveTransaction(database, {
				transactionAt: 1,
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: "s1",
				destinationSourceId: "s1",
				amount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject({ code: "SAME_TRANSFER_SOURCE" });
	});

	it("handles cross-currency transfer by normalizing toAmount", async () => {
		mocks.getSourceRow.mockResolvedValueOnce({
			id: "s1",
			currencyCode: "INR",
		});
		mocks.getSourceRow.mockResolvedValueOnce({
			id: "s2",
			currencyCode: "USD",
		});

		await transactionService.saveTransaction(database, {
			transactionAt: 1,
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

		mocks.getSourceRow.mockResolvedValueOnce({
			id: "s1",
			currencyCode: "INR",
		});
		mocks.getSourceRow.mockResolvedValueOnce({
			id: "s2",
			currencyCode: "USD",
		});

		await expect(
			transactionService.saveTransaction(database, {
				transactionAt: 1,
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: "s1",
				destinationSourceId: "s2",
				amount: "100",
				reason: " move ",
			}),
		).rejects.toMatchObject({ code: "INVALID_AMOUNT" });
	});

	it("rejects missing transfer sources and same-currency mismatch", async () => {
		mocks.getSourceRow.mockResolvedValueOnce(null);
		mocks.getSourceRow.mockResolvedValueOnce({
			id: "s2",
			currencyCode: "INR",
		});
		await expect(
			transactionService.saveTransaction(database, {
				transactionAt: 1,
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: "s1",
				destinationSourceId: "s2",
				amount: "10",
				toAmount: "10",
				reason: "ok",
			}),
		).rejects.toMatchObject({ code: "SOURCE_NOT_FOUND" });

		mocks.getSourceRow.mockResolvedValueOnce({
			id: "s1",
			currencyCode: "INR",
		});
		mocks.getSourceRow.mockResolvedValueOnce({
			id: "s2",
			currencyCode: "INR",
		});
		await transactionService.saveTransaction(database, {
			transactionAt: 1,
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
		mocks.getTransactionRow.mockResolvedValueOnce({
			id: "existing",
			items: [],
		});
		mocks.getCategoryRow.mockResolvedValueOnce({ id: "c1", name: "Food" });
		await transactionService.saveTransaction(database, {
			transactionAt: 1,
			id: "existing",
			classification: "GENERAL",
			type: "DEBIT",
			sourceId: "s1",
			categoryId: "c1",
			amount: "10",
			reason: "ok",
			items: [{ categoryId: "c1", amount: "10" }],
		});

		expect(mocks.updateTransactionRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				categoryId: undefined,
				investmentId: undefined,
			}),
			"existing",
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);
		expect(mocks.createTransactionRow).not.toHaveBeenCalled();
	});

	it("deletes transaction via repository wrapper", async () => {
		await transactionService.deleteTransaction(database, "tx-delete");
		expect(mocks.deleteTransactionRow).toHaveBeenCalledWith(
			database,
			"tx-delete",
		);
	});

	it("builds display reason fallbacks", () => {
		expect(
			transactionService.getTransactionDisplayReason({
				reason: "Groceries",
				type: "DEBIT",
				sourceName: "Cash",
				destinationSourceName: null,
			} as any),
		).toBe("Groceries");

		expect(
			transactionService.getTransactionDisplayReason({
				reason: "   ",
				type: "TRANSFER",
				sourceName: "Cash",
				destinationSourceName: "Bank",
			} as any),
		).toBe("Cash to Bank");

		expect(
			transactionService.getTransactionDisplayReason({
				reason: "   ",
				type: "TRANSFER",
				sourceName: "Cash",
				destinationSourceName: null,
			} as any),
		).toBe("Transaction");
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
