import AppError from "@/errors/AppError";
import financeRepository from "@/repositories/financeRepository";
import type Source from "@/types/Source";
import type Transaction from "@/types/Transaction";
import createId from "@/utils/id";
import moneyUtils from "@/utils/money";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	createSourceRow,
	deleteSourceRow,
	getArchivedSourceRows,
	getSourceRow,
	getSourceRows,
	getTransactionRows,
	setSourceArchivedRow,
	sourceNameExistsRow,
	updateSourceNameRow,
	validateSourceRow,
} = financeRepository;
const { addMoney, subtractMoney, ZERO_AMOUNT } = moneyUtils;

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
	database: SQLiteDatabase,
): Promise<readonly Source[]> => {
	const [sources, transactions] = await Promise.all([
		getSourceRows(database),
		getTransactionRows(database),
	]);
	const balances = getBalanceBySourceId(transactions);
	return sources.map((source) => ({
		...source,
		archived: Boolean(source.archived),
		balance: balances.get(source.id) ?? ZERO_AMOUNT,
	}));
};

const getArchivedSources = async (
	database: SQLiteDatabase,
): Promise<readonly Source[]> => {
	const [sources, transactions] = await Promise.all([
		getArchivedSourceRows(database),
		getTransactionRows(database),
	]);
	const balances = getBalanceBySourceId(transactions);
	return sources.map((source) => ({
		...source,
		archived: Boolean(source.archived),
		balance: balances.get(source.id) ?? ZERO_AMOUNT,
	}));
};

const getSource = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Source | null> => {
	const source = await getSourceRow(database, id);
	return source ? { ...source, archived: Boolean(source.archived) } : null;
};

const createSource = async (
	database: SQLiteDatabase,
	name: string,
	currencyCode: string,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError("SOURCE_NAME_REQUIRED", "Source name is required.");
	}
	if (await sourceNameExistsRow(database, normalizedName)) {
		throw new AppError(
			"SOURCE_NAME_DUPLICATE",
			`A source named "${normalizedName}" already exists.`,
		);
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
		archived: false,
	});
	return id;
};

const updateSourceName = async (
	database: SQLiteDatabase,
	id: string,
	name: string,
): Promise<void> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError("SOURCE_NAME_REQUIRED", "Source name is required.");
	}
	if (await sourceNameExistsRow(database, normalizedName, id)) {
		throw new AppError(
			"SOURCE_NAME_DUPLICATE",
			`A source named "${normalizedName}" already exists.`,
		);
	}
	await updateSourceNameRow(database, id, normalizedName, Date.now());
};

const validateSource = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => validateSourceRow(database, id, Date.now());

const setSourceArchived = async (
	database: SQLiteDatabase,
	id: string,
	archived: boolean,
): Promise<void> => setSourceArchivedRow(database, id, archived, Date.now());

const deleteSource = async (
	database: SQLiteDatabase,
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

const sourceService = {
	createSource,
	deleteSource,
	getArchivedSources,
	getSource,
	getSources,
	setSourceArchived,
	updateSourceName,
	validateSource,
};

export default sourceService;
