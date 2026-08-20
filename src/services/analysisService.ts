import appConstants from "@/constants/appConstants";
import financeRepository from "@/repositories/financeRepository";
import type AnalysisPeriod from "@/types/AnalysisPeriod";
import type AnalysisSummary from "@/types/AnalysisSummary";
import type Category from "@/types/Category";
import type CategoryAnalysis from "@/types/CategoryAnalysis";
import type CategoryCurrencySummary from "@/types/CategoryCurrencySummary";
import type DateRange from "@/types/DateRange";
import type ExchangeRate from "@/types/ExchangeRate";
import type Investment from "@/types/Investment";
import type InvestmentAnalysis from "@/types/InvestmentAnalysis";
import type Transaction from "@/types/Transaction";
import type TrendPoint from "@/types/TrendPoint";
import dateUtils from "@/utils/date";
import moneyUtils from "@/utils/money";
import type { SQLiteDatabase } from "expo-sqlite";

const { DEFAULT_CURRENCY_CODE } = appConstants;
const {
	getCategoryRows,
	getExchangeRateRows,
	getInvestmentRows,
	getTransactionRowsInRange,
} = financeRepository;
const {
	getDayWindows,
	getMonthWindowsInRange,
	getTrailingMonthWindows,
	getYearWindowsInRange,
} = dateUtils;
const {
	absoluteMoney,
	addMoney,
	compareMoney,
	multiplyMoney,
	subtractMoney,
	sumMoney,
	ZERO_AMOUNT,
} = moneyUtils;

type AnalysisOptions = Readonly<{
	dateRange: DateRange;
	isNativeCurrency: boolean;
}>;

const getRateMap = (
	rates: readonly ExchangeRate[],
): ReadonlyMap<string, string> =>
	new Map(rates.map((rate) => [rate.currencyCode, rate.rateToInr]));

const convertAmount = (
	amount: string,
	currencyCode: string,
	isNativeCurrency: boolean,
	rateMap: ReadonlyMap<string, string>,
): string | null => {
	if (isNativeCurrency || currencyCode === DEFAULT_CURRENCY_CODE) {
		return amount;
	}
	const rate = rateMap.get(currencyCode);
	return rate ? multiplyMoney(amount, rate) : null;
};

const buildCategoryAnalysis = (
	transactions: readonly Transaction[],
	categories: readonly Category[],
	isNativeCurrency: boolean,
	rateMap: ReadonlyMap<string, string>,
): readonly CategoryAnalysis[] => {
	const categoryMap = new Map(
		categories.map((category) => [category.id, category]),
	);
	const totals = new Map<string, CategoryAnalysis>();

	transactions.forEach((transaction) => {
		if (
			transaction.classification !== "GENERAL" ||
			transaction.type === "TRANSFER" ||
			!transaction.categoryId
		) {
			return;
		}
		const category = categoryMap.get(transaction.categoryId);
		if (!category) {
			return;
		}
		const amount = convertAmount(
			transaction.amount,
			transaction.sourceCurrencyCode,
			isNativeCurrency,
			rateMap,
		);
		if (!amount) {
			return;
		}
		const currencyCode = isNativeCurrency
			? transaction.sourceCurrencyCode
			: DEFAULT_CURRENCY_CODE;
		const key = `${category.id}:${currencyCode}`;
		const current = totals.get(key) ?? {
			categoryId: category.id,
			categoryName: category.name,
			type: category.type,
			currencyCode,
			credits: ZERO_AMOUNT,
			debits: ZERO_AMOUNT,
			net: ZERO_AMOUNT,
		};
		const credits =
			transaction.type === "CREDIT"
				? addMoney(current.credits, amount)
				: current.credits;
		const debits =
			transaction.type === "DEBIT"
				? addMoney(current.debits, amount)
				: current.debits;
		totals.set(key, {
			...current,
			credits,
			debits,
			net: subtractMoney(credits, debits),
		});
	});

	return [...totals.values()].sort((left, right) =>
		compareMoney(left.net, right.net),
	);
};

const buildInvestmentAnalysis = (
	transactions: readonly Transaction[],
	investments: readonly Investment[],
	isNativeCurrency: boolean,
	rateMap: ReadonlyMap<string, string>,
): readonly InvestmentAnalysis[] => {
	const investmentMap = new Map(
		investments.map((investment) => [investment.id, investment]),
	);
	const totals = new Map<string, InvestmentAnalysis>();

	transactions.forEach((transaction) => {
		if (
			transaction.classification !== "INVESTMENT" ||
			!transaction.investmentId
		) {
			return;
		}
		const investment = investmentMap.get(transaction.investmentId);
		if (!investment) {
			return;
		}
		const amount = convertAmount(
			transaction.amount,
			transaction.sourceCurrencyCode,
			isNativeCurrency,
			rateMap,
		);
		if (!amount) {
			return;
		}
		const currencyCode = isNativeCurrency
			? transaction.sourceCurrencyCode
			: DEFAULT_CURRENCY_CODE;
		const key = `${investment.id}:${currencyCode}`;
		const current = totals.get(key) ?? {
			investmentId: investment.id,
			investmentName: investment.name,
			currencyCode,
			totalInvested: ZERO_AMOUNT,
			totalRedeemed: ZERO_AMOUNT,
			net: ZERO_AMOUNT,
		};
		const totalInvested =
			transaction.type === "DEBIT"
				? addMoney(current.totalInvested, amount)
				: current.totalInvested;
		const totalRedeemed =
			transaction.type === "CREDIT"
				? addMoney(current.totalRedeemed, amount)
				: current.totalRedeemed;
		totals.set(key, {
			...current,
			totalInvested,
			totalRedeemed,
			net: subtractMoney(totalInvested, totalRedeemed),
		});
	});
	return [...totals.values()].sort((left, right) =>
		compareMoney(right.net, left.net),
	);
};

const buildCategoryCurrencySummaries = (
	categoryAnalysis: readonly CategoryAnalysis[],
): readonly CategoryCurrencySummary[] => {
	const summaries = new Map<string, CategoryCurrencySummary>();

	categoryAnalysis.forEach((category) => {
		const current = summaries.get(category.currencyCode) ?? {
			currencyCode: category.currencyCode,
			totalIncome: ZERO_AMOUNT,
			totalExpense: ZERO_AMOUNT,
			netProfit: ZERO_AMOUNT,
		};
		const totalIncome =
			category.type === "INCOME"
				? addMoney(current.totalIncome, category.net)
				: current.totalIncome;
		const totalExpense =
			category.type === "EXPENSE"
				? subtractMoney(current.totalExpense, category.net)
				: current.totalExpense;
		summaries.set(category.currencyCode, {
			...current,
			totalIncome,
			totalExpense,
			netProfit: subtractMoney(totalIncome, totalExpense),
		});
	});

	return [...summaries.values()].sort((left, right) =>
		left.currencyCode.localeCompare(right.currencyCode),
	);
};

const getMissingCurrencies = (
	transactions: readonly Transaction[],
	rateMap: ReadonlyMap<string, string>,
): readonly string[] =>
	[
		...new Set(
			transactions
				.filter((transaction) => transaction.type !== "TRANSFER")
				.map((transaction) => transaction.sourceCurrencyCode)
				.filter(
					(currencyCode) =>
						currencyCode !== DEFAULT_CURRENCY_CODE &&
						!rateMap.has(currencyCode),
				),
		),
	].sort();

// Shared by getAnalysisSummary and getMonthlyTrend so both derive totals the
// same way. REFUND categories are intentionally excluded from both totals —
// they're tracked per-category but don't move the income/expense needle.
const sumIncomeAndExpense = (
	categoryAnalysis: readonly CategoryAnalysis[],
): Readonly<{ totalIncome: string; totalExpense: string }> => {
	const totalIncome = sumMoney(
		categoryAnalysis
			.filter((category) => category.type === "INCOME")
			.map((category) => category.net),
	);
	const expenseCategoryNet = sumMoney(
		categoryAnalysis
			.filter((category) => category.type === "EXPENSE")
			.map((category) => category.net),
	);
	return {
		totalIncome,
		totalExpense: subtractMoney(ZERO_AMOUNT, expenseCategoryNet),
	};
};

const getAnalysisSummary = async (
	database: SQLiteDatabase,
	options: AnalysisOptions,
): Promise<AnalysisSummary> => {
	const [transactions, categories, investments, rates] = await Promise.all([
		getTransactionRowsInRange(
			database,
			options.dateRange.start,
			options.dateRange.end,
		),
		getCategoryRows(database),
		getInvestmentRows(database),
		getExchangeRateRows(database),
	]);
	const rateMap = getRateMap(rates);
	const categoryAnalysis = buildCategoryAnalysis(
		transactions,
		categories,
		options.isNativeCurrency,
		rateMap,
	);
	const investmentAnalysis = buildInvestmentAnalysis(
		transactions,
		investments,
		options.isNativeCurrency,
		rateMap,
	);
	const { totalIncome, totalExpense } = sumIncomeAndExpense(categoryAnalysis);
	return {
		categories: categoryAnalysis,
		investments: investmentAnalysis,
		totalIncome,
		totalExpense,
		netProfit: subtractMoney(totalIncome, totalExpense),
		missingCurrencies: options.isNativeCurrency
			? []
			: getMissingCurrencies(transactions, rateMap),
	};
};

type PeriodTrendOptions = Readonly<{
	dateRange: DateRange;
	period: AnalysisPeriod;
	anchorDate: Date;
	fyStartMonth?: number;
	minTxnDate?: number;
	maxTxnDate?: number;
}>;

// Picks time-bucket granularity based on the selected period so the chart
// always shows a meaningful number of bars regardless of zoom level.
const getTrendWindows = (
	options: PeriodTrendOptions,
): ReturnType<typeof getDayWindows> => {
	const {
		dateRange,
		period,
		anchorDate,
		fyStartMonth = 4,
		minTxnDate,
		maxTxnDate,
	} = options;
	switch (period) {
		case "MONTH":
			return getDayWindows(dateRange);
		case "YEAR":
		case "FY":
			return getMonthWindowsInRange(dateRange);
		case "YTD":
			// Trailing 12 calendar months anchored to the selected year.
			return getTrailingMonthWindows(12, anchorDate);
		case "ALL": {
			const min = minTxnDate ?? dateRange.start;
			const max = maxTxnDate ?? dateRange.end;
			return getYearWindowsInRange(min, max);
		}
		case "CUSTOM": {
			const spanMs = dateRange.end - dateRange.start;
			const DAY_MS = 86_400_000;
			if (spanMs <= 62 * DAY_MS) return getDayWindows(dateRange);
			if (spanMs <= 730 * DAY_MS)
				return getMonthWindowsInRange(dateRange);
			// Avoid using fyStartMonth for CUSTOM — full calendar years is clearest.
			const min = dateRange.start;
			const max = dateRange.end;
			return getYearWindowsInRange(min, max);
		}
	}
};

const getPeriodTrend = async (
	database: SQLiteDatabase,
	options: PeriodTrendOptions,
): Promise<readonly TrendPoint[]> => {
	const windows = getTrendWindows(options);
	if (windows.length === 0) return [];
	const rangeStart = windows[0]?.start ?? options.dateRange.start;
	const rangeEnd = windows.at(-1)?.end ?? options.dateRange.end;
	const [transactions, categories, rates] = await Promise.all([
		getTransactionRowsInRange(database, rangeStart, rangeEnd),
		getCategoryRows(database),
		getExchangeRateRows(database),
	]);
	const rateMap = getRateMap(rates);
	return windows.map((window) => {
		const windowTransactions = transactions.filter(
			(tx) =>
				tx.transactionAt >= window.start &&
				tx.transactionAt <= window.end,
		);
		const categoryAnalysis = buildCategoryAnalysis(
			windowTransactions,
			categories,
			false,
			rateMap,
		);
		const { totalIncome, totalExpense } =
			sumIncomeAndExpense(categoryAnalysis);
		return {
			label: window.label,
			income: totalIncome,
			expense: totalExpense,
			net: subtractMoney(totalIncome, totalExpense),
		};
	});
};

const getInvestmentNetLabel = (net: string): string => {
	const comparison = compareMoney(net, ZERO_AMOUNT);
	if (comparison > 0) {
		return `Net invested`;
	}
	if (comparison < 0) {
		return `Net redeemed`;
	}
	return "Net zero";
};

const getInvestmentNetAmount = (net: string): string => absoluteMoney(net);

const analysisService = {
	buildCategoryAnalysis,
	buildCategoryCurrencySummaries,
	buildInvestmentAnalysis,
	getAnalysisSummary,
	getInvestmentNetAmount,
	getInvestmentNetLabel,
	getPeriodTrend,
};

export default analysisService;
