import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	createTransactionRow: vi.fn(async () => {}),
	deleteTransactionRow: vi.fn(async () => {}),
	getSourceRow: vi.fn(async () => null),
	getTransactionRow: vi.fn(async () => null),
	getTransactionRows: vi.fn(async () => []),
	updateTransactionRow: vi.fn(async () => {}),
	createId: vi.fn(() => "edge-transaction-id"),
	compareMoney: vi.fn(() => 1),
	normalizeMoney: vi.fn((value: string) => value.trim()),
}));

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

vi.mock("@/utils/money", () => ({
	default: {
		compareMoney: mocks.compareMoney,
		normalizeMoney: mocks.normalizeMoney,
	},
}));

import transactionService from "@/services/transactionService";

const database = {} as any;

describe("transactionService defensive transfer validation", () => {
	beforeEach(() => {
		Object.values(mocks).forEach((mockFn) => {
			if (typeof mockFn === "function" && "mockClear" in mockFn) {
				mockFn.mockClear();
			}
		});
	});

	it("throws mismatch when same-currency transfer comparison is non-zero", async () => {
		mocks.getSourceRow.mockResolvedValueOnce({ id: "s1", currencyCode: "INR" });
		mocks.getSourceRow.mockResolvedValueOnce({ id: "s2", currencyCode: "INR" });

		await expect(
			transactionService.saveTransaction(database, {
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: "s1",
				destinationSourceId: "s2",
				amount: "10",
				toAmount: "10",
				reason: "move",
			}),
		).rejects.toMatchObject<AppError>({ code: "TRANSFER_AMOUNT_MISMATCH" });
	});
});
