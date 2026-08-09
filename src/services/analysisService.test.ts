import analysisService from "@/services/analysisService";

import { beforeEach, describe, expect, it } from "vitest";

import financeRepository from "@/repositories/financeRepository";
import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type Category from "@/types/Category";
import type ExchangeRate from "@/types/ExchangeRate";
import type Investment from "@/types/Investment";
import type Transaction from "@/types/Transaction";
import dateUtils from "@/utils/date";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	buildCategoryAnalysis,
	buildCategoryCurrencySummaries,
	buildInvestmentAnalysis,
	getAnalysisSummary,
	getInvestmentNetAmount,
	getInvestmentNetLabel,
} = analysisService;
const { getAnalysisDateRange } = dateUtils;
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
		type: "EXPENSE",
		createdAt: NOW,
		updatedAt: NOW,
		archived: false,
	},
	{
		id: "company-trip",
		name: "Company Trip",
		type: "EXPENSE",
		createdAt: NOW,
		updatedAt: NOW,
		archived: false,
	},
	{
		id: "salary",
		name: "Salary",
		type: "INCOME",
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
		expect(result[0]?.type).toBe("EXPENSE");
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
		expect(result[0]?.type).toBe("EXPENSE");
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

	it("excludes TRANSFER transactions even when they carry a categoryId", () => {
		const transactions: readonly Transaction[] = [
			createTransaction({
				categoryId: "rent",
				type: "TRANSFER",
				amount: "1000",
			}),
		];

		expect(
			buildCategoryAnalysis(transactions, CATEGORIES, true, new Map()),
		).toEqual([]);
	});

	it("excludes INVESTMENT-classified transactions", () => {
		const transactions: readonly Transaction[] = [
			createTransaction({
				classification: "INVESTMENT",
				categoryId: "rent",
				amount: "1000",
			}),
		];

		expect(
			buildCategoryAnalysis(transactions, CATEGORIES, true, new Map()),
		).toEqual([]);
	});

	it("excludes transactions with no categoryId or an unknown categoryId", () => {
		const transactions: readonly Transaction[] = [
			createTransaction({ categoryId: null, amount: "1000" }),
			createTransaction({
				categoryId: "unknown-category",
				amount: "1000",
			}),
		];

		expect(
			buildCategoryAnalysis(transactions, CATEGORIES, true, new Map()),
		).toEqual([]);
	});

	it("converts amounts to the default currency using the rate map when not showing native currency", () => {
		const transactions: readonly Transaction[] = [
			createTransaction({
				categoryId: "rent",
				amount: "100",
				sourceCurrencyCode: "USD",
				type: "DEBIT",
			}),
		];
		const rateMap = new Map([["USD", "83"]]);

		const result = buildCategoryAnalysis(
			transactions,
			CATEGORIES,
			false,
			rateMap,
		);

		expect(result[0]?.currencyCode).toBe("INR");
		expect(result[0]?.net).toBe("-8300");
	});

	it("excludes a transaction from converted analysis when no rate is available", () => {
		const transactions: readonly Transaction[] = [
			createTransaction({
				categoryId: "rent",
				amount: "100",
				sourceCurrencyCode: "USD",
			}),
		];

		expect(
			buildCategoryAnalysis(transactions, CATEGORIES, false, new Map()),
		).toEqual([]);
	});

	it("does not need a rate for the default currency even when converting", () => {
		const transactions: readonly Transaction[] = [
			createTransaction({
				categoryId: "rent",
				amount: "100",
				sourceCurrencyCode: "INR",
			}),
		];

		const result = buildCategoryAnalysis(
			transactions,
			CATEGORIES,
			false,
			new Map(),
		);

		expect(result[0]?.net).toBe("-100");
	});
});

describe("native currency summaries", () => {
	it("keeps different currencies separate", () => {
		const summaries = buildCategoryCurrencySummaries([
			{
				categoryId: "salary",
				categoryName: "Salary",
				type: "INCOME",
				currencyCode: "INR",
				credits: "50000",
				debits: "0",
				net: "50000",
			},
			{
				categoryId: "rent",
				categoryName: "Rent",
				type: "EXPENSE",
				currencyCode: "INR",
				credits: "13000",
				debits: "27000",
				net: "-14000",
			},
			{
				categoryId: "consulting",
				categoryName: "Consulting",
				type: "INCOME",
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
				type: "EXPENSE",
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

	it("sorts investments by net descending (most invested first)", () => {
		const investments: readonly Investment[] = [
			{
				id: "fund-a",
				name: "Fund A",
				createdAt: NOW,
				updatedAt: NOW,
				archived: false,
			},
			{
				id: "fund-b",
				name: "Fund B",
				createdAt: NOW,
				updatedAt: NOW,
				archived: false,
			},
		];
		const transactions: readonly Transaction[] = [
			createTransaction({
				id: "a-invest",
				classification: "INVESTMENT",
				investmentId: "fund-a",
				amount: "1000",
				type: "DEBIT",
			}),
			createTransaction({
				id: "b-invest",
				classification: "INVESTMENT",
				investmentId: "fund-b",
				amount: "5000",
				type: "DEBIT",
			}),
		];

		const result = buildInvestmentAnalysis(
			transactions,
			investments,
			true,
			new Map(),
		);

		expect(result.map((row) => row.investmentId)).toEqual([
			"fund-b",
			"fund-a",
		]);
	});

	it("excludes GENERAL-classified transactions and unknown investments", () => {
		const investments: readonly Investment[] = [
			{
				id: "fund-a",
				name: "Fund A",
				createdAt: NOW,
				updatedAt: NOW,
				archived: false,
			},
		];
		const transactions: readonly Transaction[] = [
			createTransaction({
				classification: "GENERAL",
				investmentId: "fund-a",
				amount: "1000",
			}),
			createTransaction({
				classification: "INVESTMENT",
				investmentId: "unknown-fund",
				amount: "1000",
			}),
		];

		expect(
			buildInvestmentAnalysis(transactions, investments, true, new Map()),
		).toEqual([]);
	});

	it("converts investment amounts using the rate map", () => {
		const investments: readonly Investment[] = [
			{
				id: "fund-a",
				name: "Fund A",
				createdAt: NOW,
				updatedAt: NOW,
				archived: false,
			},
		];
		const transactions: readonly Transaction[] = [
			createTransaction({
				classification: "INVESTMENT",
				investmentId: "fund-a",
				amount: "10",
				sourceCurrencyCode: "USD",
				type: "DEBIT",
			}),
		];

		const result = buildInvestmentAnalysis(
			transactions,
			investments,
			false,
			new Map([["USD", "83"]]),
		);

		expect(result[0]?.currencyCode).toBe("INR");
		expect(result[0]?.totalInvested).toBe("830");
	});

	it("excludes an investment transaction from converted analysis when no rate is available", () => {
		const investments: readonly Investment[] = [
			{
				id: "fund-a",
				name: "Fund A",
				createdAt: NOW,
				updatedAt: NOW,
				archived: false,
			},
		];
		const transactions: readonly Transaction[] = [
			createTransaction({
				classification: "INVESTMENT",
				investmentId: "fund-a",
				amount: "10",
				sourceCurrencyCode: "USD",
			}),
		];

		expect(
			buildInvestmentAnalysis(
				transactions,
				investments,
				false,
				new Map(),
			),
		).toEqual([]);
	});
});

describe("getInvestmentNetLabel / getInvestmentNetAmount", () => {
	it("labels a positive net as 'Net invested'", () => {
		expect(getInvestmentNetLabel("100")).toBe("Net invested");
	});

	it("labels a negative net as 'Net redeemed'", () => {
		expect(getInvestmentNetLabel("-100")).toBe("Net redeemed");
	});

	it("labels a zero net as 'Net zero'", () => {
		expect(getInvestmentNetLabel("0")).toBe("Net zero");
	});

	it("returns the absolute value of the net amount", () => {
		expect(getInvestmentNetAmount("-100")).toBe("100");
		expect(getInvestmentNetAmount("100")).toBe("100");
	});
});

describe("getAnalysisSummary (integration)", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	it("aggregates income, expenses, and net profit across categories in a date range", async () => {
		const source = await dbFixtures.insertSource(database, {
			currencyCode: "INR",
		});
		const salary = await dbFixtures.insertCategory(database, {
			name: "Salary",
			type: "INCOME",
		});
		const rent = await dbFixtures.insertCategory(database, {
			name: "Rent",
			type: "EXPENSE",
		});
		await financeRepository.createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "CREDIT",
				sourceId: source.id,
				categoryId: salary.id,
				amount: "100000",
				reason: "Salary",
				transactionAt: NOW,
			},
			"txn-salary",
			NOW,
		);
		await financeRepository.createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: rent.id,
				amount: "27000",
				reason: "Rent",
				transactionAt: NOW,
			},
			"txn-rent",
			NOW,
		);

		const summary = await getAnalysisSummary(database, {
			dateRange: { start: 0, end: 8_640_000_000_000_000 },
			isNativeCurrency: true,
		});

		expect(summary.totalIncome).toBe("100000");
		expect(summary.totalExpense).toBe("27000");
		expect(summary.netProfit).toBe("73000");
		expect(summary.categories).toHaveLength(2);
		expect(summary.missingCurrencies).toEqual([]);
	});

	it("excludes REFUND categories from totals but still lists them in categories", async () => {
		const source = await dbFixtures.insertSource(database, {
			currencyCode: "INR",
		});
		const incomeTax = await dbFixtures.insertCategory(database, {
			name: "Income Tax",
			type: "EXPENSE",
		});
		const lent = await dbFixtures.insertCategory(database, {
			name: "Lent",
			type: "REFUND",
		});
		await financeRepository.createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: incomeTax.id,
				amount: "71410",
				reason: "ITR Filing",
				transactionAt: NOW,
			},
			"txn-income-tax",
			NOW,
		);
		await financeRepository.createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "CREDIT",
				sourceId: source.id,
				categoryId: lent.id,
				amount: "100000",
				reason: "Suraj Return",
				transactionAt: NOW,
			},
			"txn-lent-return",
			NOW,
		);

		const summary = await getAnalysisSummary(database, {
			dateRange: { start: 0, end: 8_640_000_000_000_000 },
			isNativeCurrency: true,
		});

		expect(summary.totalIncome).toBe("0");
		expect(summary.totalExpense).toBe("71410");
		expect(summary.netProfit).toBe("-71410");
		expect(summary.categories).toHaveLength(2);
		expect(
			summary.categories.find(
				(category) => category.categoryId === lent.id,
			)?.net,
		).toBe("100000");
	});

	it("reports missing currencies only when converting and a rate is absent", async () => {
		const source = await dbFixtures.insertSource(database, {
			currencyCode: "USD",
		});
		const category = await dbFixtures.insertCategory(database);
		await financeRepository.createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				amount: "10",
				reason: "Coffee",
				transactionAt: NOW,
			},
			"txn-usd",
			NOW,
		);

		const nativeSummary = await getAnalysisSummary(database, {
			dateRange: { start: 0, end: 8_640_000_000_000_000 },
			isNativeCurrency: true,
		});
		expect(nativeSummary.missingCurrencies).toEqual([]);

		const convertedSummary = await getAnalysisSummary(database, {
			dateRange: { start: 0, end: 8_640_000_000_000_000 },
			isNativeCurrency: false,
		});
		expect(convertedSummary.missingCurrencies).toEqual(["USD"]);
		// Without a rate, the USD transaction is excluded from totals entirely.
		expect(convertedSummary.categories).toEqual([]);
	});

	it("does not report a currency as missing once a rate is configured", async () => {
		const source = await dbFixtures.insertSource(database, {
			currencyCode: "USD",
		});
		const category = await dbFixtures.insertCategory(database);
		await financeRepository.createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				amount: "10",
				reason: "Coffee",
				transactionAt: NOW,
			},
			"txn-usd",
			NOW,
		);
		const rate: ExchangeRate = {
			currencyCode: "USD",
			rateToInr: "83",
			source: "MANUAL",
			fetchedAt: null,
			updatedAt: NOW,
		};
		await financeRepository.upsertExchangeRateRow(database, rate);

		const summary = await getAnalysisSummary(database, {
			dateRange: { start: 0, end: 8_640_000_000_000_000 },
			isNativeCurrency: false,
		});

		expect(summary.missingCurrencies).toEqual([]);
		expect(summary.totalExpense).toBe("830");
	});

	it("only includes transactions within the requested date range", async () => {
		const source = await dbFixtures.insertSource(database);
		const category = await dbFixtures.insertCategory(database);
		await financeRepository.createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				amount: "500",
				reason: "In range",
				transactionAt: 1000,
			},
			"txn-in-range",
			NOW,
		);
		await financeRepository.createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				amount: "999",
				reason: "Out of range",
				transactionAt: 5000,
			},
			"txn-out-of-range",
			NOW,
		);

		const summary = await getAnalysisSummary(database, {
			dateRange: { start: 0, end: 2000 },
			isNativeCurrency: true,
		});

		expect(summary.totalExpense).toBe("500");
	});

	it("handles high-volume multi-year transactions for Month, Year, FY, and YTD ranges", async () => {
		const source = await dbFixtures.insertSource(database, {
			name: "Main Bank",
			currencyCode: "INR",
		});
		const destination = await dbFixtures.insertSource(database, {
			name: "Wallet",
			currencyCode: "INR",
		});
		const incomeCategory = await dbFixtures.insertCategory(database, {
			name: "Salary",
			type: "INCOME",
		});
		const expenseCategory = await dbFixtures.insertCategory(database, {
			name: "Living",
			type: "EXPENSE",
		});

		const txDate = (year: number, month1: number, day: number): number =>
			new Date(year, month1 - 1, day, 12, 0, 0, 0).getTime();
		let transactionIndex = 0;

		for (const year of [2023, 2024, 2025]) {
			for (const month of [1, 2, 3]) {
				const createdAt = txDate(year, month, 1);
				const rows = [
					{
						classification: "GENERAL" as const,
						type: "CREDIT" as const,
						sourceId: source.id,
						categoryId: incomeCategory.id,
						amount: "100000",
						reason: `Salary ${year}-${month}`,
						transactionAt: txDate(year, month, 5),
					},
					{
						classification: "GENERAL" as const,
						type: "DEBIT" as const,
						sourceId: source.id,
						categoryId: expenseCategory.id,
						amount: "20000",
						reason: `Rent ${year}-${month}`,
						transactionAt: txDate(year, month, 10),
					},
					{
						classification: "GENERAL" as const,
						type: "DEBIT" as const,
						sourceId: source.id,
						categoryId: expenseCategory.id,
						amount: "6000",
						reason: `Groceries ${year}-${month}`,
						transactionAt: txDate(year, month, 15),
					},
					{
						classification: "GENERAL" as const,
						type: "DEBIT" as const,
						sourceId: source.id,
						categoryId: expenseCategory.id,
						amount: "4000",
						reason: `Utilities ${year}-${month}`,
						transactionAt: txDate(year, month, 20),
					},
					{
						classification: "GENERAL" as const,
						type: "CREDIT" as const,
						sourceId: source.id,
						categoryId: expenseCategory.id,
						amount: "1000",
						reason: `Expense refund ${year}-${month}`,
						transactionAt: txDate(year, month, 25),
					},
					{
						classification: "GENERAL" as const,
						type: "TRANSFER" as const,
						sourceId: source.id,
						destinationSourceId: destination.id,
						amount: "5000",
						toAmount: "5000",
						reason: `Move to wallet ${year}-${month}`,
						transactionAt: txDate(year, month, 28),
					},
				];

				for (const row of rows) {
					transactionIndex += 1;
					await financeRepository.createTransactionRow(
						database,
						row,
						`txn-${transactionIndex}`,
						createdAt,
					);
				}
			}
		}

		const monthSummary = await getAnalysisSummary(database, {
			dateRange: getAnalysisDateRange("MONTH", new Date(2025, 1, 20)),
			isNativeCurrency: true,
		});
		expect(monthSummary.totalIncome).toBe("100000");
		expect(monthSummary.totalExpense).toBe("29000");
		expect(monthSummary.netProfit).toBe("71000");

		const yearSummary = await getAnalysisSummary(database, {
			dateRange: getAnalysisDateRange("YEAR", new Date(2024, 6, 1)),
			isNativeCurrency: true,
		});
		expect(yearSummary.totalIncome).toBe("300000");
		expect(yearSummary.totalExpense).toBe("87000");
		expect(yearSummary.netProfit).toBe("213000");

		const fySummary = await getAnalysisSummary(database, {
			dateRange: getAnalysisDateRange("FY", new Date(2025, 1, 20), 4),
			isNativeCurrency: true,
		});
		expect(fySummary.totalIncome).toBe("300000");
		expect(fySummary.totalExpense).toBe("87000");
		expect(fySummary.netProfit).toBe("213000");

		const ytdSummary = await getAnalysisSummary(database, {
			dateRange: getAnalysisDateRange("YTD", new Date(2025, 3, 1)),
			isNativeCurrency: true,
		});
		expect(ytdSummary.totalIncome).toBe("300000");
		expect(ytdSummary.totalExpense).toBe("87000");
		expect(ytdSummary.netProfit).toBe("213000");

		const minMax =
			await financeRepository.getTransactionMinMaxDate(database);
		expect(minMax).not.toBeNull();
		expect(minMax?.minDate).toBe(txDate(2023, 1, 5));
		expect(minMax?.maxDate).toBe(txDate(2025, 3, 28));

		const yearRows = await financeRepository.getTransactionRowsInRange(
			database,
			getAnalysisDateRange("YEAR", new Date(2024, 6, 1)).start,
			getAnalysisDateRange("YEAR", new Date(2024, 6, 1)).end,
		);
		expect(yearRows).toHaveLength(18);
	});
});
