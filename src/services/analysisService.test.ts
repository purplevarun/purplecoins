import { describe, expect, it } from "vitest";

import type { Category } from "@/types/Category";
import type { Investment } from "@/types/Investment";
import type { Transaction } from "@/types/Transaction";

import {
	buildCategoryAnalysis,
	buildCategoryCurrencySummaries,
	buildInvestmentAnalysis,
} from "@/services/analysisService";

const NOW = 1_780_754_481_000;

const createTransaction = (overrides: Partial<Transaction>): Transaction => ({
	id: "transaction",
	classification: "GENERAL",
	type: "DEBIT",
	sourceId: "source",
	destinationSourceId: null,
	amount: "0",
	toAmount: null,
	categoryId: null,
	tripId: null,
	investmentId: null,
	reason: "Test",
	transactionAt: NOW,
	createdAt: NOW,
	updatedAt: NOW,
	sourceName: "Bank",
	sourceCurrencyCode: "INR",
	destinationSourceName: null,
	destinationCurrencyCode: null,
	categoryName: null,
	tripName: null,
	investmentName: null,
	hasAttachment: false,
	...overrides,
});

const CATEGORIES: readonly Category[] = [
	{
		id: "rent",
		name: "Domo Living Rent",
		isIncome: false,
		createdAt: NOW,
		updatedAt: NOW,
		archived: false,
	},
	{
		id: "company-trip",
		name: "Company Trip",
		isIncome: false,
		createdAt: NOW,
		updatedAt: NOW,
		archived: false,
	},
	{
		id: "salary",
		name: "Salary",
		isIncome: true,
		createdAt: NOW,
		updatedAt: NOW,
		archived: false,
	},
];

describe("category-driven analysis", () => {
	it("nets reimbursements against the category debit", () => {
		const transactions: readonly Transaction[] = [
			createTransaction({
				id: "rent-paid",
				categoryId: "rent",
				amount: "27000",
				type: "DEBIT",
			}),
			createTransaction({
				id: "wife-contribution",
				categoryId: "rent",
				amount: "13000",
				type: "CREDIT",
			}),
		];

		const result = buildCategoryAnalysis(
			transactions,
			CATEGORIES,
			true,
			new Map(),
		);

		expect(result).toHaveLength(1);
		expect(result[0]?.net).toBe("-14000");
		expect(result[0]?.isIncome).toBe(false);
	});

	it("keeps a positive expense-category net out of the income bucket", () => {
		const transactions: readonly Transaction[] = [
			createTransaction({
				id: "trip-spend",
				categoryId: "company-trip",
				amount: "400",
				type: "DEBIT",
			}),
			createTransaction({
				id: "trip-reimbursement",
				categoryId: "company-trip",
				amount: "800",
				type: "CREDIT",
			}),
		];

		const result = buildCategoryAnalysis(
			transactions,
			CATEGORIES,
			true,
			new Map(),
		);

		expect(result[0]?.net).toBe("400");
		expect(result[0]?.isIncome).toBe(false);
	});

	it("sorts the most expense-heavy category first", () => {
		const transactions: readonly Transaction[] = [
			createTransaction({
				id: "rent",
				categoryId: "rent",
				amount: "14000",
				type: "DEBIT",
			}),
			createTransaction({
				id: "trip",
				categoryId: "company-trip",
				amount: "400",
				type: "CREDIT",
			}),
			createTransaction({
				id: "salary",
				categoryId: "salary",
				amount: "100000",
				type: "CREDIT",
			}),
		];

		const result = buildCategoryAnalysis(
			transactions,
			CATEGORIES,
			true,
			new Map(),
		);

		expect(result.map((row) => row.categoryId)).toEqual([
			"rent",
			"company-trip",
			"salary",
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
		const investments: readonly Investment[] = [
			{
				id: "mutual-fund",
				name: "Mutual Fund",
				createdAt: NOW,
				updatedAt: NOW,
				archived: false,
			},
		];
		const transactions: readonly Transaction[] = [
			createTransaction({
				id: "invested",
				classification: "INVESTMENT",
				investmentId: "mutual-fund",
				amount: "10000",
				type: "DEBIT",
			}),
			createTransaction({
				id: "redeemed",
				classification: "INVESTMENT",
				investmentId: "mutual-fund",
				amount: "2500",
				type: "CREDIT",
			}),
		];

		const result = buildInvestmentAnalysis(
			transactions,
			investments,
			true,
			new Map(),
		);

		expect(result[0]?.totalInvested).toBe("10000");
		expect(result[0]?.totalRedeemed).toBe("2500");
		expect(result[0]?.net).toBe("7500");
	});
});
