import type Transaction from "@/types/Transaction";
import type TrendPoint from "@/types/TrendPoint";
import moneyUtils from "@/utils/money";

const { addMoney, subtractMoney, ZERO_AMOUNT } = moneyUtils;

const getYear = (timestamp: number): string =>
	String(new Date(timestamp).getFullYear());

// Aggregates every transaction into yearly points, independent of any selected analysis period.
const getTrendSeries = (
	transactions: readonly Transaction[],
): readonly TrendPoint[] => {
	const map = new Map<string, TrendPoint>();
	transactions.forEach((transaction) => {
		const year = getYear(transaction.transactionAt);
		const current = map.get(year) ?? {
			year,
			income: ZERO_AMOUNT,
			expenses: ZERO_AMOUNT,
			networth: ZERO_AMOUNT,
		};
		const nextIncome =
			transaction.classification === "GENERAL" &&
			transaction.type === "CREDIT" &&
			transaction.categoryId
				? addMoney(current.income, transaction.amount)
				: current.income;
		const nextExpenses =
			transaction.classification === "GENERAL" &&
			transaction.type === "DEBIT" &&
			transaction.categoryId
				? addMoney(current.expenses, transaction.amount)
				: current.expenses;
		const nextNetworth = addMoney(
			subtractMoney(current.networth, current.expenses),
			nextIncome,
		);
		map.set(year, {
			...current,
			income: nextIncome,
			expenses: nextExpenses,
			networth: nextNetworth,
		});
	});
	return [...map.values()].sort((left, right) =>
		left.year.localeCompare(right.year),
	);
};

export { getTrendSeries, getYear };
