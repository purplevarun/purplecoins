import appConstants from "@/constants/appConstants";
import financeRepository from "@/repositories/financeRepository";
import type AnalysisOptions from "@/types/AnalysisOptions";
import type AnalysisSummary from "@/types/AnalysisSummary";
import type CategoryAnalysis from "@/types/CategoryAnalysis";
import type CategoryAnalysisRow from "@/types/CategoryAnalysisRow";
import type CategoryCurrencySummary from "@/types/CategoryCurrencySummary";
import type ExchangeRate from "@/types/ExchangeRate";
import type InvestmentAnalysis from "@/types/InvestmentAnalysis";
import type InvestmentAnalysisRow from "@/types/InvestmentAnalysisRow";
import moneyUtils from "@/utils/money";
import type { SQLiteDatabase } from "expo-sqlite";

const { DEFAULT_CURRENCY_CODE } = appConstants;
const {
	getCategoryAnalysisRows,
	getExchangeRateRows,
	getInvestmentAnalysisRows,
	getTransactionCurrencyRows,
} = financeRepository;
const {
	absoluteMoney,
	addMoney,
	compareMoney,
	multiplyMoney,
	subtractMoney,
	sumMoney,
	sumToMoney,
	ZERO_AMOUNT,
} = moneyUtils;

const getRateMap = (
	rates: readonly ExchangeRate[],
): ReadonlyMap<string, string> =>
	new Map(rates.map((rate) => [rate.currencyCode, rate.rateToInr]));

const getConversionRate = (
	currencyCode: string,
	isNativeCurrency: boolean,
	rateMap: ReadonlyMap<string, string>,
): string | null => {
	if (isNativeCurrency || currencyCode === DEFAULT_CURRENCY_CODE) {
		return "1";
	}
	return rateMap.get(currencyCode) || null;
};

const buildCategoryAnalysis = (
	rows: readonly CategoryAnalysisRow[],
	isNativeCurrency: boolean,
	rateMap: ReadonlyMap<string, string>,
): readonly CategoryAnalysis[] => {
	const totals = new Map<string, CategoryAnalysis>();

	rows.forEach((row) => {
		const rate = getConversionRate(
			row.currencyCode,
			isNativeCurrency,
			rateMap,
		);
		if (rate === null) {
			return;
		}
		const currencyCode = isNativeCurrency
			? row.currencyCode
			: DEFAULT_CURRENCY_CODE;
		const key = `${row.categoryId}:${currencyCode}`;
		const current = totals.get(key) ?? {
			categoryId: row.categoryId,
			categoryName: row.categoryName,
			isIncome: Boolean(row.isIncome),
			currencyCode,
			credits: ZERO_AMOUNT,
			debits: ZERO_AMOUNT,
			net: ZERO_AMOUNT,
		};
		const credits = addMoney(
			current.credits,
			multiplyMoney(sumToMoney(row.credits), rate),
		);
		const debits = addMoney(
			current.debits,
			multiplyMoney(sumToMoney(row.debits), rate),
		);
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
	rows: readonly InvestmentAnalysisRow[],
	isNativeCurrency: boolean,
	rateMap: ReadonlyMap<string, string>,
): readonly InvestmentAnalysis[] => {
	const totals = new Map<string, InvestmentAnalysis>();

	rows.forEach((row) => {
		const rate = getConversionRate(
			row.currencyCode,
			isNativeCurrency,
			rateMap,
		);
		if (rate === null) {
			return;
		}
		const currencyCode = isNativeCurrency
			? row.currencyCode
			: DEFAULT_CURRENCY_CODE;
		const key = `${row.investmentId}:${currencyCode}`;
		const current = totals.get(key) ?? {
			investmentId: row.investmentId,
			investmentName: row.investmentName,
			currencyCode,
			totalInvested: ZERO_AMOUNT,
			totalRedeemed: ZERO_AMOUNT,
			net: ZERO_AMOUNT,
		};
		const totalInvested = addMoney(
			current.totalInvested,
			multiplyMoney(sumToMoney(row.totalInvested), rate),
		);
		const totalRedeemed = addMoney(
			current.totalRedeemed,
			multiplyMoney(sumToMoney(row.totalRedeemed), rate),
		);
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
		const totalIncome = category.isIncome
			? addMoney(current.totalIncome, category.net)
			: current.totalIncome;
		const totalExpense = category.isIncome
			? current.totalExpense
			: subtractMoney(current.totalExpense, category.net);
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
	currencyCodes: readonly string[],
	rateMap: ReadonlyMap<string, string>,
): readonly string[] =>
	currencyCodes.filter(
		(currencyCode) =>
			currencyCode !== DEFAULT_CURRENCY_CODE &&
			!rateMap.has(currencyCode),
	);

const getAnalysisSummary = async (
	database: SQLiteDatabase,
	options: AnalysisOptions,
): Promise<AnalysisSummary> => {
	const { start, end } = options.dateRange;
	const [categoryRows, investmentRows, rates, currencyRows] =
		await Promise.all([
			getCategoryAnalysisRows(database, start, end),
			getInvestmentAnalysisRows(database, start, end),
			getExchangeRateRows(database),
			options.isNativeCurrency
				? []
				: getTransactionCurrencyRows(database, start, end),
		]);
	const rateMap = getRateMap(rates);
	const categoryAnalysis = buildCategoryAnalysis(
		categoryRows,
		options.isNativeCurrency,
		rateMap,
	);
	const investmentAnalysis = buildInvestmentAnalysis(
		investmentRows,
		options.isNativeCurrency,
		rateMap,
	);
	const totalIncome = sumMoney(
		categoryAnalysis
			.filter((category) => category.isIncome)
			.map((category) => category.net),
	);
	const expenseCategoryNet = sumMoney(
		categoryAnalysis
			.filter((category) => !category.isIncome)
			.map((category) => category.net),
	);
	const totalExpense = subtractMoney(ZERO_AMOUNT, expenseCategoryNet);
	return {
		categories: categoryAnalysis,
		investments: investmentAnalysis,
		totalIncome,
		totalExpense,
		netProfit: subtractMoney(totalIncome, totalExpense),
		missingCurrencies: getMissingCurrencies(
			currencyRows.map((row) => row.currencyCode),
			rateMap,
		),
	};
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
};

export default analysisService;
