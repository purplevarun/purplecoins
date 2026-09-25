import analysisService from "@/services/analysisService";

import { describe, expect, it } from "vitest";

import type CategoryAnalysisRow from "@/types/CategoryAnalysisRow";
import type InvestmentAnalysisRow from "@/types/InvestmentAnalysisRow";

const {
	buildCategoryAnalysis,
	buildCategoryCurrencySummaries,
	buildInvestmentAnalysis,
} = analysisService;

const createCategoryRow = (
	overrides: Partial<CategoryAnalysisRow>,
): CategoryAnalysisRow => ({
	categoryId: "rent",
	categoryName: "Domo Living Rent",
	isIncome: 0,
	currencyCode: "INR",
	credits: 0,
	debits: 0,
	...overrides,
});

const createInvestmentRow = (
	overrides: Partial<InvestmentAnalysisRow>,
): InvestmentAnalysisRow => ({
	investmentId: "mutual-fund",
	investmentName: "Mutual Fund",
	currencyCode: "INR",
	totalInvested: 0,
	totalRedeemed: 0,
	...overrides,
});

describe("category-driven analysis", () => {
	it("nets reimbursements against the category debit", () => {
		const result = buildCategoryAnalysis(
			[createCategoryRow({ credits: 13000, debits: 27000 })],
			true,
			new Map(),
		);

		expect(result).toHaveLength(1);
		expect(result[0]?.net).toBe("-14000");
		expect(result[0]?.isIncome).toBe(false);
	});

	it("keeps a positive expense-category net out of the income bucket", () => {
		const result = buildCategoryAnalysis(
			[
				createCategoryRow({
					categoryId: "company-trip",
					categoryName: "Company Trip",
					credits: 800,
					debits: 400,
				}),
			],
			true,
			new Map(),
		);

		expect(result[0]?.net).toBe("400");
		expect(result[0]?.isIncome).toBe(false);
	});

	it("cleans float noise from SQL sums", () => {
		const result = buildCategoryAnalysis(
			[createCategoryRow({ credits: 0.1 + 0.2, debits: 0.1 })],
			true,
			new Map(),
		);

		expect(result[0]?.credits).toBe("0.3");
		expect(result[0]?.net).toBe("0.2");
	});

	it("sorts the most expense-heavy category first", () => {
		const result = buildCategoryAnalysis(
			[
				createCategoryRow({ categoryId: "rent", debits: 14000 }),
				createCategoryRow({
					categoryId: "company-trip",
					credits: 400,
				}),
				createCategoryRow({
					categoryId: "salary",
					isIncome: 1,
					credits: 100000,
				}),
			],
			true,
			new Map(),
		);

		expect(result.map((row) => row.categoryId)).toEqual([
			"rent",
			"company-trip",
			"salary",
		]);
	});

	it("merges converted currencies into one base bucket and skips missing rates", () => {
		const result = buildCategoryAnalysis(
			[
				createCategoryRow({ credits: 100, debits: 500 }),
				createCategoryRow({
					currencyCode: "USD",
					credits: 0,
					debits: 10,
				}),
				createCategoryRow({
					currencyCode: "EUR",
					credits: 0,
					debits: 999,
				}),
			],
			false,
			new Map([["USD", "80"]]),
		);

		expect(result).toEqual([
			{
				categoryId: "rent",
				categoryName: "Domo Living Rent",
				isIncome: false,
				currencyCode: "INR",
				credits: "100",
				debits: "1300",
				net: "-1200",
			},
		]);
	});
});

describe("native currency summaries", () => {
	it("keeps different currencies separate", () => {
		const summaries = buildCategoryCurrencySummaries([
			{
				categoryId: "salary",
				categoryName: "Salary",
				isIncome: true,
				currencyCode: "INR",
				credits: "50000",
				debits: "0",
				net: "50000",
			},
			{
				categoryId: "rent",
				categoryName: "Rent",
				isIncome: false,
				currencyCode: "INR",
				credits: "13000",
				debits: "27000",
				net: "-14000",
			},
			{
				categoryId: "consulting",
				categoryName: "Consulting",
				isIncome: true,
				currencyCode: "USD",
				credits: "100",
				debits: "0",
				net: "100",
			},
		]);

		expect(summaries).toEqual([
			{
				currencyCode: "INR",
				totalIncome: "50000",
				totalExpense: "14000",
				netProfit: "36000",
			},
			{
				currencyCode: "USD",
				totalIncome: "100",
				totalExpense: "0",
				netProfit: "100",
			},
		]);
	});

	it("keeps a positive expense-category net in the expense bucket", () => {
		const summaries = buildCategoryCurrencySummaries([
			{
				categoryId: "company-trip",
				categoryName: "Company Trip",
				isIncome: false,
				currencyCode: "INR",
				credits: "5000",
				debits: "4000",
				net: "1000",
			},
		]);

		expect(summaries[0]).toEqual({
			currencyCode: "INR",
			totalIncome: "0",
			totalExpense: "-1000",
			netProfit: "1000",
		});
	});
});

describe("investment analysis", () => {
	it("reports invested, redeemed, and net invested", () => {
		const result = buildInvestmentAnalysis(
			[
				createInvestmentRow({
					totalInvested: 10000,
					totalRedeemed: 2500,
				}),
			],
			true,
			new Map(),
		);

		expect(result[0]?.totalInvested).toBe("10000");
		expect(result[0]?.totalRedeemed).toBe("2500");
		expect(result[0]?.net).toBe("7500");
	});

	it("merges converted currencies, skips missing rates, and sorts by net descending", () => {
		const result = buildInvestmentAnalysis(
			[
				createInvestmentRow({
					investmentId: "inv1",
					investmentName: "Index Fund",
					totalInvested: 100,
				}),
				createInvestmentRow({
					investmentId: "inv1",
					investmentName: "Index Fund",
					currencyCode: "USD",
					totalRedeemed: 20,
				}),
				createInvestmentRow({
					investmentId: "inv2",
					investmentName: "Bond",
					totalInvested: 50,
				}),
				createInvestmentRow({
					investmentId: "inv3",
					investmentName: "Unpriced",
					currencyCode: "EUR",
					totalInvested: 999,
				}),
			],
			false,
			new Map([["USD", "2"]]),
		);

		expect(result).toEqual([
			expect.objectContaining({
				investmentId: "inv1",
				totalInvested: "100",
				totalRedeemed: "40",
				net: "60",
			}),
			expect.objectContaining({ investmentId: "inv2", net: "50" }),
		]);
	});
});
