import type TestAsyncFunction from "@test/types/TestAsyncFunction";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getCategoryAnalysisRows: vi.fn<TestAsyncFunction>().mockResolvedValue([]),
	getExchangeRateRows: vi.fn<TestAsyncFunction>().mockResolvedValue([]),
	getInvestmentAnalysisRows: vi.fn<TestAsyncFunction>().mockResolvedValue([]),
	getTransactionCurrencyRows: vi
		.fn<TestAsyncFunction>()
		.mockResolvedValue([]),
}));

vi.mock("@/constants/appConstants", () => ({
	default: {
		DEFAULT_CURRENCY_CODE: "INR",
	},
}));

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		getCategoryAnalysisRows: mocks.getCategoryAnalysisRows,
		getExchangeRateRows: mocks.getExchangeRateRows,
		getInvestmentAnalysisRows: mocks.getInvestmentAnalysisRows,
		getTransactionCurrencyRows: mocks.getTransactionCurrencyRows,
	},
}));

import analysisService from "@/services/analysisService";

const database = {} as any;

describe("analysisService summary", () => {
	beforeEach(() => {
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("returns summary and missing currencies in base-currency mode", async () => {
		mocks.getCategoryAnalysisRows.mockResolvedValueOnce([
			{
				categoryId: "salary",
				categoryName: "Salary",
				isIncome: 1,
				currencyCode: "USD",
				credits: 100,
				debits: 0,
			},
			{
				categoryId: "rent",
				categoryName: "Rent",
				isIncome: 0,
				currencyCode: "EUR",
				credits: 0,
				debits: 40,
			},
		]);
		mocks.getInvestmentAnalysisRows.mockResolvedValueOnce([
			{
				investmentId: "mf",
				investmentName: "Fund",
				currencyCode: "USD",
				totalInvested: 25,
				totalRedeemed: 0,
			},
		]);
		mocks.getExchangeRateRows.mockResolvedValueOnce([
			{ currencyCode: "USD", rateToInr: "80" },
		]);
		mocks.getTransactionCurrencyRows.mockResolvedValueOnce([
			{ currencyCode: "EUR" },
			{ currencyCode: "INR" },
			{ currencyCode: "USD" },
		]);

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
		expect(mocks.getCategoryAnalysisRows).toHaveBeenCalledExactlyOnceWith(
			database,
			1,
			2,
		);
		expect(mocks.getInvestmentAnalysisRows).toHaveBeenCalledExactlyOnceWith(
			database,
			1,
			2,
		);
		expect(
			mocks.getTransactionCurrencyRows,
		).toHaveBeenCalledExactlyOnceWith(database, 1, 2);
	});

	it("skips the currency query and missing currencies in native mode", async () => {
		mocks.getCategoryAnalysisRows.mockResolvedValueOnce([
			{
				categoryId: "c1",
				categoryName: "Groceries",
				isIncome: 0,
				currencyCode: "EUR",
				credits: 0,
				debits: 10,
			},
		]);

		const summary = await analysisService.getAnalysisSummary(database, {
			dateRange: { start: 1, end: 2 },
			isNativeCurrency: true,
		});

		expect(summary.missingCurrencies).toEqual([]);
		expect(summary.totalExpense).toBe("10");
		expect(mocks.getTransactionCurrencyRows).not.toHaveBeenCalled();
	});

	it("includes expense categories in total expense aggregation", async () => {
		mocks.getCategoryAnalysisRows.mockResolvedValueOnce([
			{
				categoryId: "salary",
				categoryName: "Salary",
				isIncome: 1,
				currencyCode: "INR",
				credits: 100,
				debits: 0,
			},
			{
				categoryId: "rent",
				categoryName: "Rent",
				isIncome: 0,
				currencyCode: "INR",
				credits: 0,
				debits: 40,
			},
		]);

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
