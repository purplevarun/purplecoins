import type { WebDatabase } from "@/db/database";

import {
	createSourceRow,
	deleteSourceRow,
	getSourceRow,
	getSourceRows,
	getTransactionRows,
	updateSourceNameRow,
	validateSourceRow,
} from "@/repositories/financeRepository";
import type { Source } from "@/types/Source";
import type { Transaction } from "@/types/Transaction";
import { AppError } from "@/utils/AppError";
import { createId } from "@/utils/id";
import { addMoney, subtractMoney, ZERO_AMOUNT } from "@/utils/money";

const normalizeCurrencyCode = (currencyCode: string): string => {
	const normalizedCode = currencyCode.trim().toUpperCase();
	if (!/^[A-Z]{3}$/.test(normalizedCode)) {
		throw new AppError(
			"INVALID_CURRENCY",
			"Currency must be a three-letter ISO code.",
		);
	}
	return normalizedCode;
};

const getBalanceBySourceId = (
	transactions: readonly Transaction[],
): ReadonlyMap<string, string> => {
	const balances = new Map<string, string>();
	const applyDelta = (sourceId: string, delta: string): void => {
		const currentBalance = balances.get(sourceId) ?? ZERO_AMOUNT;
		balances.set(sourceId, addMoney(currentBalance, delta));
	};

	transactions.forEach((transaction) => {
		if (transaction.type === "CREDIT") {
			applyDelta(transaction.sourceId, transaction.amount);
			return;
		}
		applyDelta(
			transaction.sourceId,
			subtractMoney(ZERO_AMOUNT, transaction.amount),
		);
		if (
			transaction.type === "TRANSFER" &&
			transaction.destinationSourceId &&
			transaction.toAmount
		) {
			applyDelta(transaction.destinationSourceId, transaction.toAmount);
		}
	});
	return balances;
};

const getSources = async (
	database: WebDatabase,
): Promise<readonly Source[]> => {
	const [sources, transactions] = await Promise.all([
		getSourceRows(database),
		getTransactionRows(database),
	]);
	const balances = getBalanceBySourceId(transactions);
	return sources.map((source) => ({
		...source,
		balance: balances.get(source.id) ?? ZERO_AMOUNT,
	}));
};

const getSource = async (
	database: WebDatabase,
	id: string,
): Promise<Source | null> => getSourceRow(database, id);

const createSource = async (
	database: WebDatabase,
	name: string,
	currencyCode: string,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError("SOURCE_NAME_REQUIRED", "Source name is required.");
	}
	const now = Date.now();
	const id = createId();
	await createSourceRow(database, {
		id,
		name: normalizedName,
		currencyCode: normalizeCurrencyCode(currencyCode),
		validatedAt: null,
		createdAt: now,
		updatedAt: now,
		latestTransactionCreatedAt: null,
		balance: ZERO_AMOUNT,
	});
	return id;
};

const updateSourceName = async (
	database: WebDatabase,
	id: string,
	name: string,
): Promise<void> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError("SOURCE_NAME_REQUIRED", "Source name is required.");
	}
	await updateSourceNameRow(database, id, normalizedName, Date.now());
};

const validateSource = async (
	database: WebDatabase,
	id: string,
): Promise<void> => validateSourceRow(database, id, Date.now());

const deleteSource = async (
	database: WebDatabase,
	id: string,
): Promise<void> => {
	try {
		await deleteSourceRow(database, id);
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes("FOREIGN KEY")) {
			throw new AppError(
				"SOURCE_IN_USE",
				"Sources linked to transactions cannot be deleted.",
			);
		}
		throw error;
	}
};

export {
	createSource,
	deleteSource,
	getSource,
	getSources,
	updateSourceName,
	validateSource,
};
