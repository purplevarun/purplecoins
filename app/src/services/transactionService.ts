import appConstants from "@/constants/appConstants";
import AppError from "@/errors/AppError";
import financeRepository from "@/repositories/financeRepository";
import attachmentService from "@/services/attachmentService";
import type AttachmentInput from "@/types/AttachmentInput";
import type DateRange from "@/types/DateRange";
import type LinkedTransactionFilter from "@/types/LinkedTransactionFilter";
import type Transaction from "@/types/Transaction";
import type TransactionClassification from "@/types/TransactionClassification";
import type TransactionCursor from "@/types/TransactionCursor";
import type TransactionInput from "@/types/TransactionInput";
import type TransactionItemInput from "@/types/TransactionItemInput";
import type TransactionPage from "@/types/TransactionPage";
import createId from "@/utils/id";
import moneyUtils from "@/utils/money";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	createTransactionRow,
	createTransactionItemRow,
	deleteTransactionRow,
	deleteTransactionItemRows,
	getCategoryRow,
	getSourceRow,
	getTransactionPageRows,
	getTransactionRow,
	getTransactionRows,
	updateTransactionRow,
} = financeRepository;
const { compareMoney, normalizeMoney, sumMoney } = moneyUtils;
const { saveAttachment, deleteAttachment } = attachmentService;
const { TRANSACTION_PAGE_SIZE } = appConstants;

const mapTransaction = (transaction: Transaction): Transaction => ({
	...transaction,
	hasAttachment: Boolean(transaction.hasAttachment),
});

const getTransactions = async (
	database: SQLiteDatabase,
	dateRange?: DateRange,
): Promise<readonly Transaction[]> => {
	const transactions = dateRange
		? await getTransactionRows(database, dateRange.start, dateRange.end)
		: await getTransactionRows(database);
	return transactions.map(mapTransaction);
};

const getTransactionPage = async (
	database: SQLiteDatabase,
	cursor?: TransactionCursor,
	classification?: TransactionClassification,
): Promise<TransactionPage> => {
	const rows = await getTransactionPageRows(
		database,
		TRANSACTION_PAGE_SIZE + 1,
		cursor,
		classification,
	);
	return {
		transactions: rows.slice(0, TRANSACTION_PAGE_SIZE).map(mapTransaction),
		hasMore: rows.length > TRANSACTION_PAGE_SIZE,
	};
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
		return (
			transaction.categoryId === filter.entityId ||
			transaction.items.some(
				(item) => item.categoryId === filter.entityId,
			)
		);
	}
	if (filter.kind === "TRIP") {
		return transaction.tripId === filter.entityId;
	}
	return transaction.investmentId === filter.entityId;
};

const getLinkedTransactions = async (
	database: SQLiteDatabase,
	filter: LinkedTransactionFilter,
): Promise<readonly Transaction[]> => {
	const transactions = await getTransactions(database);
	return transactions.filter((transaction) =>
		isLinkedTransaction(transaction, filter),
	);
};

const getTransaction = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Transaction | null> => {
	const transaction = await getTransactionRow(database, id);
	return transaction ? mapTransaction(transaction) : null;
};

const validateRequiredInvestmentReason = (reason: string): string => {
	const normalizedReason = reason.trim();
	if (!normalizedReason) {
		throw new AppError(
			"TRANSACTION_REASON_REQUIRED",
			"Reason is required.",
		);
	}
	return normalizedReason;
};

const resolveGeneralTransactionReason = async (
	database: SQLiteDatabase,
	categoryId: string,
	reason: string,
): Promise<string> => {
	const normalizedReason = reason.trim();
	if (normalizedReason) {
		return normalizedReason;
	}
	const category = await getCategoryRow(database, categoryId);
	if (!category) {
		throw new AppError(
			"CATEGORY_NOT_FOUND",
			"The selected category no longer exists.",
		);
	}
	return category.name.trim();
};

const prepareExpenseInput = async (
	database: SQLiteDatabase,
	input: TransactionInput,
): Promise<TransactionInput> => {
	if (!input.items?.length) {
		throw new AppError(
			"TRANSACTION_ITEMS_REQUIRED",
			"Add at least one expense item.",
		);
	}
	const items: TransactionItemInput[] = [];
	const categoryNames = new Set<string>();
	for (const [position, item] of input.items.entries()) {
		try {
			if (!item.categoryId)
				throw new AppError("CATEGORY_REQUIRED", "Select a category.");
			const amount = normalizeMoney(item.amount);
			const category = await getCategoryRow(database, item.categoryId);
			if (!category)
				throw new AppError(
					"CATEGORY_NOT_FOUND",
					"The selected category no longer exists.",
				);
			items.push({ ...item, amount });
			categoryNames.add(category.name.trim());
		} catch (error) {
			if (error instanceof AppError)
				throw new AppError(
					error.code,
					`Item ${position + 1}: ${error.message}`,
				);
			throw error;
		}
	}
	return {
		...input,
		items,
		amount: sumMoney(items.map((item) => item.amount)),
		reason: input.reason.trim() || [...categoryNames].join(", "),
		categoryId: undefined,
		investmentId: undefined,
		destinationSourceId: undefined,
		toAmount: undefined,
	};
};

const prepareTransactionInput = async (
	database: SQLiteDatabase,
	input: TransactionInput,
): Promise<TransactionInput> => {
	if (input.classification === "GENERAL" && input.type === "DEBIT") {
		return prepareExpenseInput(database, input);
	}
	if (input.items !== undefined) {
		throw new AppError(
			"TRANSACTION_ITEMS_UNSUPPORTED",
			"Only expenses can contain items.",
		);
	}
	const amount = normalizeMoney(input.amount);
	if (input.classification === "INVESTMENT") {
		if (!input.investmentId) {
			throw new AppError("INVESTMENT_REQUIRED", "Select an investment.");
		}
		return {
			...input,
			type: input.type === "TRANSFER" ? "DEBIT" : input.type,
			amount,
			reason: validateRequiredInvestmentReason(input.reason),
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
			reason: await resolveGeneralTransactionReason(
				database,
				input.categoryId,
				input.reason,
			),
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
	database: SQLiteDatabase,
	input: TransactionInput,
	attachment?: AttachmentInput | null,
): Promise<string> => {
	if (!input.sourceId) {
		throw new AppError("SOURCE_REQUIRED", "Select a source.");
	}
	const id = input.id ?? createId();
	await database.withTransactionAsync(async () => {
		const transaction = database;
		const preparedInput = await prepareTransactionInput(transaction, input);
		if (
			preparedInput.type !== "TRANSFER" &&
			!(await getSourceRow(transaction, preparedInput.sourceId))
		) {
			throw new AppError(
				"SOURCE_NOT_FOUND",
				"The selected source no longer exists.",
			);
		}
		const existing = input.id
			? await getTransactionRow(transaction, id)
			: null;
		if (input.id && !existing)
			throw new AppError(
				"TRANSACTION_NOT_FOUND",
				"This transaction no longer exists.",
			);
		const previousItems = new Map(
			existing?.items.map((item) => [item.id, item]),
		);
		const retainedIds = new Set<string>();
		for (const item of preparedInput.items ?? []) {
			if (
				item.id !== undefined &&
				(!previousItems.has(item.id) || retainedIds.has(item.id))
			) {
				throw new AppError(
					"TRANSACTION_ITEM_INVALID",
					"An expense item does not belong to this payment or was added twice.",
				);
			}
			if (item.id) retainedIds.add(item.id);
		}
		const now = Date.now();
		if (existing) {
			await deleteTransactionItemRows(transaction, id);
		}
		if (existing) {
			await updateTransactionRow(transaction, preparedInput, id, now);
		} else {
			await createTransactionRow(transaction, preparedInput, id, now);
		}
		for (const [position, item] of (preparedInput.items ?? []).entries()) {
			await createTransactionItemRow(transaction, {
				id: item.id ?? createId(),
				transactionId: id,
				categoryId: item.categoryId,
				amount: item.amount,
				position,
				createdAt: previousItems.get(item.id ?? "")?.createdAt ?? now,
				updatedAt: now,
			});
		}
		if (attachment === null) {
			await deleteAttachment(transaction, "TRANSACTION", id);
		} else if (attachment !== undefined) {
			await saveAttachment(transaction, "TRANSACTION", id, attachment);
		}
	});
	return id;
};

const deleteTransaction = async (
	database: SQLiteDatabase,
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

const transactionService = {
	deleteTransaction,
	getLinkedTransactions,
	getTransaction,
	getTransactionDisplayReason,
	getTransactionPage,
	getTransactions,
	saveTransaction,
};

export default transactionService;
