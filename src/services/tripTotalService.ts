import type { SQLiteDatabase } from "expo-sqlite";

import { getTransactionRows } from "@/repositories/financeRepository";
import type { Transaction } from "@/types/Transaction";
import type { TripTotal } from "@/types/TripTotal";
import { addMoney, subtractMoney, ZERO_AMOUNT } from "@/utils/money";

const getTripTotalKey = (tripId: string, currencyCode: string): string =>
	`${tripId}:${currencyCode}`;

const shouldIncludeTransaction = (transaction: Transaction): boolean =>
	transaction.classification === "GENERAL" &&
	transaction.type !== "TRANSFER" &&
	Boolean(transaction.tripId);

const buildTripTotals = (
	transactions: readonly Transaction[],
): readonly TripTotal[] => {
	const totals = new Map<string, TripTotal>();

	transactions.filter(shouldIncludeTransaction).forEach((transaction) => {
		const tripId = transaction.tripId;
		if (!tripId) {
			return;
		}
		const key = getTripTotalKey(tripId, transaction.sourceCurrencyCode);
		const current = totals.get(key) ?? {
			tripId,
			currencyCode: transaction.sourceCurrencyCode,
			credits: ZERO_AMOUNT,
			debits: ZERO_AMOUNT,
			total: ZERO_AMOUNT,
		};
		const credits =
			transaction.type === "CREDIT"
				? addMoney(current.credits, transaction.amount)
				: current.credits;
		const debits =
			transaction.type === "DEBIT"
				? addMoney(current.debits, transaction.amount)
				: current.debits;
		totals.set(key, {
			...current,
			credits,
			debits,
			total: subtractMoney(debits, credits),
		});
	});

	return [...totals.values()].sort((left, right) =>
		left.currencyCode.localeCompare(right.currencyCode),
	);
};

const getTripTotals = async (
	database: SQLiteDatabase,
): Promise<readonly TripTotal[]> => {
	const transactions = await getTransactionRows(database);
	return buildTripTotals(transactions);
};

export { buildTripTotals, getTripTotals };
