import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getCategoryRows: vi.fn(async () => []),
	getExchangeRateRows: vi.fn(async () => []),
	getInvestmentRows: vi.fn(async () => []),
	getTransactionRowsInRange: vi.fn(async () => []),
}));

vi.mock("@/constants/appConstants", () => ({
	default: {
		DEFAULT_CURRENCY_CODE: "INR",
	},
}));

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		getCategoryRows: mocks.getCategoryRows,
		getExchangeRateRows: mocks.getExchangeRateRows,
		getInvestmentRows: mocks.getInvestmentRows,
		getTransactionRowsInRange: mocks.getTransactionRowsInRange,
	},
}));

import analysisService from "@/services/analysisService";

const database = {} as any;
const NOW = 1_780_754_481_000;

describe("analysisService summary", () => {
	beforeEach(() => {
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("returns summary and missing currencies in base-currency mode", async () => {
		mocks.getCategoryRows.mockResolvedValueOnce([
			{ id: "salary", name: "Salary", isIncome: true },
			{ id: "rent", name: "Rent", isIncome: false },
		]);
		mocks.getInvestmentRows.mockResolvedValueOnce([
			{ id: "mf", name: "Fund" },
		]);
		mocks.getExchangeRateRows.mockResolvedValueOnce([
			{ currencyCode: "USD", rateToInr: "80" },
		]);
		mocks.getTransactionRowsInRange.mockResolvedValueOnce([
			{
				id: "t1",
				classification: "GENERAL",
				type: "CREDIT",
				amount: "100",
				categoryId: "salary",
				sourceCurrencyCode: "USD",
				createdAt: NOW,
				updatedAt: NOW,
				transactionAt: NOW,
				sourceId: "s1",
				reason: "a",
			},
			{
				id: "t2",
				classification: "GENERAL",
				type: "DEBIT",
				amount: "40",
				categoryId: "rent",
				sourceCurrencyCode: "EUR",
				createdAt: NOW,
				updatedAt: NOW,
				transactionAt: NOW,
				sourceId: "s1",
				reason: "b",
			},
			{
				id: "t3",
				classification: "INVESTMENT",
				type: "DEBIT",
				amount: "25",
				investmentId: "mf",
				sourceCurrencyCode: "USD",
				createdAt: NOW,
				updatedAt: NOW,
				transactionAt: NOW,
				sourceId: "s1",
				reason: "c",
			},
		] as any);

		const summary = await analysisService.getAnalysisSummary(database, {
			dateRange: { start: 1, end: 2 },
			isNativeCurrency: false,
		});

		expect(summary.totalIncome).toBe("8000");
		expect(summary.totalExpense).toBe("0");
		expect(summary.netProfit).toBe("8000");
		expect(summary.missingCurrencies).toEqual(["EUR"]);
		expect(summary.investments[0]).toEqual(
			expect.objectContaining({ net: "2000" }),
		);
	});

	it("suppresses missing currencies in native mode", async () => {
		mocks.getCategoryRows.mockResolvedValueOnce([]);
		mocks.getInvestmentRows.mockResolvedValueOnce([]);
		mocks.getExchangeRateRows.mockResolvedValueOnce([]);
		mocks.getTransactionRowsInRange.mockResolvedValueOnce([
			{
				classification: "GENERAL",
				type: "DEBIT",
				amount: "10",
				categoryId: "c1",
				sourceCurrencyCode: "EUR",
			},
		] as any);

		const summary = await analysisService.getAnalysisSummary(database, {
			dateRange: { start: 1, end: 2 },
			isNativeCurrency: true,
		});
		expect(summary.missingCurrencies).toEqual([]);
	});

	it("includes expense categories in total expense aggregation", async () => {
		mocks.getCategoryRows.mockResolvedValueOnce([
			{ id: "salary", name: "Salary", isIncome: true },
			{ id: "rent", name: "Rent", isIncome: false },
		]);
		mocks.getInvestmentRows.mockResolvedValueOnce([]);
		mocks.getExchangeRateRows.mockResolvedValueOnce([]);
		mocks.getTransactionRowsInRange.mockResolvedValueOnce([
			{
				classification: "GENERAL",
				type: "CREDIT",
				amount: "100",
				categoryId: "salary",
				sourceCurrencyCode: "INR",
			},
			{
				classification: "GENERAL",
				type: "DEBIT",
				amount: "40",
				categoryId: "rent",
				sourceCurrencyCode: "INR",
			},
		] as any);

		const summary = await analysisService.getAnalysisSummary(database, {
			dateRange: { start: 1, end: 2 },
			isNativeCurrency: false,
		});

		expect(summary.totalIncome).toBe("100");
		expect(summary.totalExpense).toBe("40");
		expect(summary.netProfit).toBe("60");
	});

	it("returns investment net labels and absolute net amount", () => {
		expect(analysisService.getInvestmentNetLabel("10")).toBe(
			"Net invested",
		);
		expect(analysisService.getInvestmentNetLabel("-1")).toBe(
			"Net redeemed",
		);
		expect(analysisService.getInvestmentNetLabel("0")).toBe("Net zero");
		expect(analysisService.getInvestmentNetAmount("-123.45")).toBe(
			"123.45",
		);
	});
});
