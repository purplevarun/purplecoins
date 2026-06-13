import type { WebDatabase } from "@/db/database";

import {
	createTransactionRow,
	deleteTransactionRow,
	getSourceRow,
	getTransactionRow,
	getTransactionRows,
	updateTransactionRow,
} from "@/repositories/financeRepository";
import type { LinkedTransactionFilter } from "@/types/LinkedTransactionFilter";
import type { Transaction } from "@/types/Transaction";
import type { TransactionInput } from "@/types/TransactionInput";
import { AppError } from "@/utils/AppError";
import { createId } from "@/utils/id";
import { compareMoney, normalizeMoney } from "@/utils/money";

const mapTransaction = (transaction: Transaction): Transaction => ({
	...transaction,
	hasAttachment: Boolean(transaction.hasAttachment),
});

const getTransactions = async (
	database: WebDatabase,
): Promise<readonly Transaction[]> => {
	const transactions = await getTransactionRows(database);
	return transactions.map(mapTransaction);
};

const isLinkedTransaction = (
	transaction: Transaction,
	filter: LinkedTransactionFilter,
): boolean => {
	if (filter.kind === "SOURCE") {
		return (
			transaction.sourceId === filter.entityId ||
			transaction.destinationSourceId === filter.entityId
		);
	}
	if (filter.kind === "CATEGORY") {
		return transaction.categoryId === filter.entityId;
	}
	if (filter.kind === "TRIP") {
		return transaction.tripId === filter.entityId;
	}
	return transaction.investmentId === filter.entityId;
};

const getLinkedTransactions = async (
	database: WebDatabase,
	filter: LinkedTransactionFilter,
): Promise<readonly Transaction[]> => {
	const transactions = await getTransactions(database);
	return transactions.filter((transaction) =>
		isLinkedTransaction(transaction, filter),
	);
};

const getTransaction = async (
	database: WebDatabase,
	id: string,
): Promise<Transaction | null> => {
	const transaction = await getTransactionRow(database, id);
	return transaction ? mapTransaction(transaction) : null;
};

const validateRequiredReason = (reason: string): string => {
	const normalizedReason = reason.trim();
	if (!normalizedReason) {
		throw new AppError(
			"TRANSACTION_REASON_REQUIRED",
			"Reason is required.",
		);
	}
	return normalizedReason;
};

const prepareTransactionInput = async (
	database: WebDatabase,
	input: TransactionInput,
): Promise<TransactionInput> => {
	const amount = normalizeMoney(input.amount);
	if (input.classification === "INVESTMENT") {
		if (!input.investmentId) {
			throw new AppError("INVESTMENT_REQUIRED", "Select an investment.");
		}
		return {
			...input,
			type: input.type === "TRANSFER" ? "DEBIT" : input.type,
			amount,
			reason: validateRequiredReason(input.reason),
			categoryId: undefined,
			tripId: undefined,
			destinationSourceId: undefined,
			toAmount: undefined,
		};
	}

	if (input.type !== "TRANSFER") {
		if (!input.categoryId) {
			throw new AppError("CATEGORY_REQUIRED", "Select a category.");
		}
		return {
			...input,
			amount,
			reason: validateRequiredReason(input.reason),
			investmentId: undefined,
			destinationSourceId: undefined,
			toAmount: undefined,
		};
	}

	if (!input.destinationSourceId) {
		throw new AppError(
			"DESTINATION_REQUIRED",
			"Select a destination source.",
		);
	}
	if (input.sourceId === input.destinationSourceId) {
		throw new AppError(
			"SAME_TRANSFER_SOURCE",
			"Transfer sources must be different.",
		);
	}
	const [source, destination] = await Promise.all([
		getSourceRow(database, input.sourceId),
		getSourceRow(database, input.destinationSourceId),
	]);
	if (!source || !destination) {
		throw new AppError(
			"SOURCE_NOT_FOUND",
			"One of the selected sources no longer exists.",
		);
	}
	const toAmount =
		source.currencyCode === destination.currencyCode
			? amount
			: normalizeMoney(input.toAmount ?? "");
	if (
		source.currencyCode === destination.currencyCode &&
		compareMoney(amount, toAmount) !== 0
	) {
		throw new AppError(
			"TRANSFER_AMOUNT_MISMATCH",
			"Same-currency transfer amounts must match.",
		);
	}
	return {
		...input,
		classification: "GENERAL",
		amount,
		toAmount,
		reason: input.reason.trim(),
		categoryId: undefined,
		tripId: undefined,
		investmentId: undefined,
	};
};

const saveTransaction = async (
	database: WebDatabase,
	input: TransactionInput,
): Promise<string> => {
	if (!input.sourceId) {
		throw new AppError("SOURCE_REQUIRED", "Select a source.");
	}
	const preparedInput = await prepareTransactionInput(database, input);
	const now = Date.now();
	const id = input.id ?? createId();
	if (input.id) {
		await updateTransactionRow(database, preparedInput, id, now);
		return id;
	}
	await createTransactionRow(database, preparedInput, id, now);
	return id;
};

const deleteTransaction = async (
	database: WebDatabase,
	id: string,
): Promise<void> => deleteTransactionRow(database, id);

const getTransactionDisplayReason = (transaction: Transaction): string => {
	if (transaction.reason.trim()) {
		return transaction.reason;
	}
	if (transaction.type === "TRANSFER" && transaction.destinationSourceName) {
		return `${transaction.sourceName} to ${transaction.destinationSourceName}`;
	}
	return "Transaction";
};

export {
	deleteTransaction,
	getLinkedTransactions,
	getTransaction,
	getTransactionDisplayReason,
	getTransactions,
	saveTransaction,
};
