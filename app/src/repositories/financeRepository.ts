import type { SQLiteDatabase } from "expo-sqlite";

import type Budget from "@/types/Budget";
import type Category from "@/types/Category";
import type CategoryAnalysisRow from "@/types/CategoryAnalysisRow";
import type ExchangeRate from "@/types/ExchangeRate";
import type Investment from "@/types/Investment";
import type InvestmentAnalysisRow from "@/types/InvestmentAnalysisRow";
import type InvestmentType from "@/types/InvestmentType";
import type SimpleEntity from "@/types/SimpleEntity";
import type Source from "@/types/Source";
import type Transaction from "@/types/Transaction";
import type TransactionClassification from "@/types/TransactionClassification";
import type TransactionCursor from "@/types/TransactionCursor";
import type TransactionDateBounds from "@/types/TransactionDateBounds";
import type TransactionInput from "@/types/TransactionInput";
import type TransactionItem from "@/types/TransactionItem";
import type Trip from "@/types/Trip";
import type TripTotalRow from "@/types/TripTotalRow";

const TRANSACTION_SELECT = `
	SELECT
		t.id,
		t.classification,
		t.type,
		t.source_id AS sourceId,
		t.destination_source_id AS destinationSourceId,
		t.amount,
		t.to_amount AS toAmount,
		t.category_id AS categoryId,
		t.trip_id AS tripId,
		t.investment_id AS investmentId,
		t.reason,
		t.transaction_at AS transactionAt,
		t.created_at AS createdAt,
		t.updated_at AS updatedAt,
		source.name AS sourceName,
		source.currency_code AS sourceCurrencyCode,
		destination.name AS destinationSourceName,
		destination.currency_code AS destinationCurrencyCode,
		category.name AS categoryName,
		trip.name AS tripName,
		investment.name AS investmentName,
		platform.name AS platformName,
		trip_type.name AS tripTypeName,
		EXISTS(
			SELECT 1 FROM attachments attachment
			WHERE attachment.owner_type = 'TRANSACTION'
				AND attachment.owner_id = t.id
		) AS hasAttachment
	FROM transactions t
	INNER JOIN sources source ON source.id = t.source_id
	LEFT JOIN sources destination ON destination.id = t.destination_source_id
	LEFT JOIN categories category ON category.id = t.category_id
	LEFT JOIN trips trip ON trip.id = t.trip_id
	LEFT JOIN investments investment ON investment.id = t.investment_id
	LEFT JOIN investment_platforms platform ON platform.id = investment.platform_id
	LEFT JOIN trip_types trip_type ON trip_type.id = trip.trip_type_id
	`;

const getSourceRows = async (
	database: SQLiteDatabase,
): Promise<readonly Source[]> =>
	database.getAllAsync<Source>(`
		SELECT
			source.id,
			source.name,
			source.currency_code AS currencyCode,
			source.validated_at AS validatedAt,
			source.created_at AS createdAt,
			source.updated_at AS updatedAt,
			MAX(txn.created_at) AS latestTransactionCreatedAt,
			COALESCE(source.archived, 0) AS archived,
			'0' AS balance
		FROM sources source
		LEFT JOIN transactions txn
			ON txn.source_id = source.id
			OR txn.destination_source_id = source.id
		WHERE COALESCE(source.archived, 0) = 0
		GROUP BY source.id
		ORDER BY
			COUNT(txn.id) DESC,
			COALESCE(MAX(txn.created_at), 0) DESC,
			lower(source.name) ASC;
	`);

const getArchivedSourceRows = async (
	database: SQLiteDatabase,
): Promise<readonly Source[]> =>
	database.getAllAsync<Source>(`
		SELECT
			source.id,
			source.name,
			source.currency_code AS currencyCode,
			source.validated_at AS validatedAt,
			source.created_at AS createdAt,
			source.updated_at AS updatedAt,
			MAX(txn.created_at) AS latestTransactionCreatedAt,
			COALESCE(source.archived, 0) AS archived,
			'0' AS balance
		FROM sources source
		LEFT JOIN transactions txn
			ON txn.source_id = source.id
			OR txn.destination_source_id = source.id
		WHERE COALESCE(source.archived, 0) = 1
		GROUP BY source.id
		ORDER BY lower(source.name) ASC;
	`);

const getSourceRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Source | null> =>
	database.getFirstAsync<Source>(
		`
			SELECT
				source.id,
				source.name,
				source.currency_code AS currencyCode,
				source.validated_at AS validatedAt,
				source.created_at AS createdAt,
				source.updated_at AS updatedAt,
				MAX(txn.created_at) AS latestTransactionCreatedAt,
				COALESCE(source.archived, 0) AS archived,
				'0' AS balance
			FROM sources source
			LEFT JOIN transactions txn
				ON txn.source_id = source.id
				OR txn.destination_source_id = source.id
			WHERE source.id = ?
			GROUP BY source.id;
		`,
		id,
	);

const createSourceRow = async (
	database: SQLiteDatabase,
	source: Source,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO sources (
				id, name, currency_code, validated_at, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?);
		`,
		source.id,
		source.name,
		source.currencyCode,
		source.validatedAt,
		source.createdAt,
		source.updatedAt,
	);
};

const updateSourceNameRow = async (
	database: SQLiteDatabase,
	id: string,
	name: string,
	updatedAt: number,
): Promise<void> => {
	await database.runAsync(
		"UPDATE sources SET name = ?, updated_at = ? WHERE id = ?;",
		name,
		updatedAt,
		id,
	);
};

const validateSourceRow = async (
	database: SQLiteDatabase,
	id: string,
	validatedAt: number,
): Promise<void> => {
	await database.runAsync(
		"UPDATE sources SET validated_at = ? WHERE id = ?;",
		validatedAt,
		id,
	);
};

const setSourceArchivedRow = async (
	database: SQLiteDatabase,
	id: string,
	archived: boolean,
	updatedAt: number,
): Promise<void> => {
	await database.runAsync(
		"UPDATE sources SET archived = ?, updated_at = ? WHERE id = ?;",
		archived ? 1 : 0,
		updatedAt,
		id,
	);
};

const sourceNameExistsRow = async (
	database: SQLiteDatabase,
	name: string,
	excludeId?: string,
): Promise<boolean> => {
	const row = excludeId
		? await database.getFirstAsync<Pick<SimpleEntity, "id">>(
				`
					SELECT id FROM sources
					WHERE lower(name) = lower(?)
						AND COALESCE(archived, 0) = 0
						AND id != ?
					LIMIT 1;
				`,
				name,
				excludeId,
			)
		: await database.getFirstAsync<Pick<SimpleEntity, "id">>(
				`
					SELECT id FROM sources
					WHERE lower(name) = lower(?)
						AND COALESCE(archived, 0) = 0
					LIMIT 1;
				`,
				name,
			);
	return row !== null;
};

const deleteSourceRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	await database.runAsync("DELETE FROM sources WHERE id = ?;", id);
};

const getCategoryRows = async (
	database: SQLiteDatabase,
	isIncome?: boolean,
): Promise<readonly Category[]> =>
	database.getAllAsync<Category>(
		`
		SELECT
			category.id,
			category.name,
			category.is_income AS isIncome,
			category.created_at AS createdAt,
			category.updated_at AS updatedAt,
			COALESCE(category.archived, 0) AS archived
		FROM categories category
		LEFT JOIN (
			SELECT id, category_id, created_at FROM transactions WHERE category_id IS NOT NULL
			UNION
			SELECT txn.id, item.category_id, txn.created_at
			FROM transaction_items item JOIN transactions txn ON txn.id = item.transaction_id
		) txn ON txn.category_id = category.id
		WHERE COALESCE(category.archived, 0) = 0
			${isIncome === undefined ? "" : "AND category.is_income = ?"}
		GROUP BY category.id
		ORDER BY
			COUNT(txn.id) DESC,
			COALESCE(MAX(txn.created_at), 0) DESC,
			lower(category.name) ASC;
		`,
		...(isIncome === undefined ? [] : [isIncome ? 1 : 0]),
	);

const getArchivedCategoryRows = async (
	database: SQLiteDatabase,
): Promise<readonly Category[]> =>
	database.getAllAsync<Category>(`
		SELECT
			id,
			name,
			is_income AS isIncome,
			created_at AS createdAt,
			updated_at AS updatedAt,
			COALESCE(archived, 0) AS archived
		FROM categories
		WHERE COALESCE(archived, 0) = 1
		ORDER BY lower(name) ASC;
	`);

const getCategoryRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Category | null> =>
	database.getFirstAsync<Category>(
		`
			SELECT
				id,
				name,
				is_income AS isIncome,
				created_at AS createdAt,
				updated_at AS updatedAt,
				COALESCE(archived, 0) AS archived
			FROM categories
			WHERE id = ?;
		`,
		id,
	);

const upsertCategoryRow = async (
	database: SQLiteDatabase,
	category: Category,
): Promise<void> => {
	const result = await database.runAsync(
		`UPDATE categories SET name = ?, is_income = ?, updated_at = ? WHERE id = ?;`,
		category.name,
		category.isIncome ? 1 : 0,
		category.updatedAt,
		category.id,
	);
	if (result.changes > 0) return;
	await database.runAsync(
		`
			INSERT INTO categories (
				id, name, is_income, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?);
		`,
		category.id,
		category.name,
		category.isIncome ? 1 : 0,
		category.createdAt,
		category.updatedAt,
	);
};

const deleteCategoryRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	await database.runAsync("DELETE FROM categories WHERE id = ?;", id);
};

const setCategoryArchivedRow = async (
	database: SQLiteDatabase,
	id: string,
	archived: boolean,
	updatedAt: number,
): Promise<void> => {
	await database.runAsync(
		"UPDATE categories SET archived = ?, updated_at = ? WHERE id = ?;",
		archived ? 1 : 0,
		updatedAt,
		id,
	);
};

const categoryNameExistsRow = async (
	database: SQLiteDatabase,
	name: string,
	excludeId?: string,
): Promise<boolean> => {
	const row = excludeId
		? await database.getFirstAsync<Pick<SimpleEntity, "id">>(
				`
					SELECT id FROM categories
					WHERE lower(name) = lower(?)
						AND COALESCE(archived, 0) = 0
						AND id != ?
					LIMIT 1;
				`,
				name,
				excludeId,
			)
		: await database.getFirstAsync<Pick<SimpleEntity, "id">>(
				`
					SELECT id FROM categories
					WHERE lower(name) = lower(?)
						AND COALESCE(archived, 0) = 0
					LIMIT 1;
				`,
				name,
			);
	return row !== null;
};

const getTripRows = async (
	database: SQLiteDatabase,
): Promise<readonly Trip[]> =>
	database.getAllAsync<Trip>(`
		SELECT
			trip.id,
			trip.name,
			trip.trip_type_id AS tripTypeId,
			trip_type.name AS tripTypeName,
			trip.created_at AS createdAt,
			trip.updated_at AS updatedAt,
			COALESCE(trip.archived, 0) AS archived
		FROM trips trip
		LEFT JOIN trip_types trip_type ON trip_type.id = trip.trip_type_id
		LEFT JOIN transactions txn ON txn.trip_id = trip.id
		WHERE COALESCE(trip.archived, 0) = 0
		GROUP BY trip.id
		ORDER BY
			COUNT(txn.id) DESC,
			COALESCE(MAX(txn.created_at), 0) DESC,
			lower(trip.name) ASC;
	`);

const getArchivedTripRows = async (
	database: SQLiteDatabase,
): Promise<readonly Trip[]> =>
	database.getAllAsync<Trip>(`
		SELECT
			id,
			name,
			trip_type_id AS tripTypeId,
			trip_type.name AS tripTypeName,
			created_at AS createdAt,
			updated_at AS updatedAt,
			COALESCE(archived, 0) AS archived
		FROM trips
		LEFT JOIN trip_types trip_type ON trip_type.id = trips.trip_type_id
		WHERE COALESCE(archived, 0) = 1
		ORDER BY lower(name) ASC;
	`);

const getTripRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Trip | null> =>
	database.getFirstAsync<Trip>(
		`
			SELECT
				trips.id, trips.name, trips.trip_type_id AS tripTypeId,
				trip_type.name AS tripTypeName,
				trips.created_at AS createdAt, trips.updated_at AS updatedAt,
				COALESCE(archived, 0) AS archived
			FROM trips
			LEFT JOIN trip_types trip_type ON trip_type.id = trips.trip_type_id
			WHERE trips.id = ?;
		`,
		id,
	);

const getInvestmentRows = async (
	database: SQLiteDatabase,
): Promise<readonly Investment[]> =>
	database.getAllAsync<Investment>(`
		SELECT
			investment.id,
			investment.name,
			investment.investment_type_id AS investmentTypeId,
			investment_type.name AS investmentTypeName,
			investment.platform_id AS platformId,
			platform.name AS platformName,
			investment.created_at AS createdAt,
			investment.updated_at AS updatedAt,
			COALESCE(investment.archived, 0) AS archived
		FROM investments investment
		LEFT JOIN transactions txn ON txn.investment_id = investment.id
		LEFT JOIN investment_types investment_type
			ON investment_type.id = investment.investment_type_id
		LEFT JOIN investment_platforms platform ON platform.id = investment.platform_id
		WHERE COALESCE(investment.archived, 0) = 0
		GROUP BY investment.id
		ORDER BY
			COUNT(txn.id) DESC,
			COALESCE(MAX(txn.created_at), 0) DESC,
			lower(investment.name) ASC;
	`);

const getArchivedInvestmentRows = async (
	database: SQLiteDatabase,
): Promise<readonly Investment[]> =>
	database.getAllAsync<Investment>(`
		SELECT
			investment.id,
			investment.name,
			investment.investment_type_id AS investmentTypeId,
			investment_type.name AS investmentTypeName,
			investment.platform_id AS platformId,
			investment.created_at AS createdAt,
			investment.updated_at AS updatedAt,
			COALESCE(investment.archived, 0) AS archived
		FROM investments investment
		LEFT JOIN investment_types investment_type
			ON investment_type.id = investment.investment_type_id
		WHERE COALESCE(investment.archived, 0) = 1
		ORDER BY lower(investment.name) ASC;
	`);

const getInvestmentRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Investment | null> =>
	database.getFirstAsync<Investment>(
		`
			SELECT
				id, name, investment_type_id AS investmentTypeId, platform_id AS platformId,
				created_at AS createdAt, updated_at AS updatedAt,
				COALESCE(archived, 0) AS archived
			FROM investments
			WHERE id = ?;
		`,
		id,
	);

const upsertInvestmentRow = async (
	database: SQLiteDatabase,
	investment: Pick<
		Investment,
		| "id"
		| "name"
		| "investmentTypeId"
		| "platformId"
		| "createdAt"
		| "updatedAt"
	>,
): Promise<void> => {
	const result = await database.runAsync(
		`UPDATE investments SET name = ?, investment_type_id = ?, platform_id = ?, updated_at = ? WHERE id = ?;`,
		investment.name,
		investment.investmentTypeId,
		investment.platformId ?? null,
		investment.updatedAt,
		investment.id,
	);
	if (result.changes > 0) return;
	await database.runAsync(
		`
			INSERT INTO investments
				(id, name, investment_type_id, platform_id, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?);
		`,
		investment.id,
		investment.name,
		investment.investmentTypeId,
		investment.platformId ?? null,
		investment.createdAt,
		investment.updatedAt,
	);
};

const getInvestmentTypeRows = async (
	database: SQLiteDatabase,
): Promise<readonly InvestmentType[]> =>
	database.getAllAsync<InvestmentType>(`
		SELECT id, name, created_at AS createdAt, updated_at AS updatedAt
		FROM investment_types
		ORDER BY lower(name) ASC;
	`);

const upsertInvestmentTypeRow = async (
	database: SQLiteDatabase,
	entity: SimpleEntity,
): Promise<void> => {
	const result = await database.runAsync(
		`UPDATE investment_types SET name = ?, updated_at = ? WHERE id = ?;`,
		entity.name,
		entity.updatedAt,
		entity.id,
	);
	if (result.changes > 0) return;
	await database.runAsync(
		`
			INSERT INTO investment_types (id, name, created_at, updated_at)
			VALUES (?, ?, ?, ?);
		`,
		entity.id,
		entity.name,
		entity.createdAt,
		entity.updatedAt,
	);
};

const investmentTypeNameExistsRow = async (
	database: SQLiteDatabase,
	name: string,
): Promise<boolean> => {
	const row = await database.getFirstAsync<Pick<SimpleEntity, "id">>(
		`SELECT id FROM investment_types WHERE lower(name) = lower(?) LIMIT 1;`,
		name,
	);
	return row !== null;
};

const upsertSimpleEntityRow = async (
	database: SQLiteDatabase,
	tableName: "trips" | "investments",
	entity: SimpleEntity & { tripTypeId?: string | null },
): Promise<void> => {
	const updateResult = await database.runAsync(
		`
			UPDATE ${tableName}
			SET name = ?,
				${tableName === "trips" ? "trip_type_id = ?," : ""}
				updated_at = ?
			WHERE id = ?;
		`,
		entity.name,
		...(tableName === "trips" ? [entity.tripTypeId ?? null] : []),
		entity.updatedAt,
		entity.id,
	);
	if ((updateResult as { changes?: number } | undefined)?.changes) return;
	await database.runAsync(
		`INSERT INTO ${tableName} (${tableName === "trips" ? "id, name, trip_type_id, created_at, updated_at" : "id, name, created_at, updated_at"})
		 VALUES (${tableName === "trips" ? "?, ?, ?, ?, ?" : "?, ?, ?, ?"});`,
		entity.id,
		entity.name,
		...(tableName === "trips" ? [entity.tripTypeId ?? null] : []),
		entity.createdAt,
		entity.updatedAt,
	);
};

const deleteSimpleEntityRow = async (
	database: SQLiteDatabase,
	tableName: "trips" | "investments",
	id: string,
): Promise<void> => {
	await database.runAsync(`DELETE FROM ${tableName} WHERE id = ?;`, id);
};

const setSimpleEntityArchivedRow = async (
	database: SQLiteDatabase,
	tableName: "trips" | "investments",
	id: string,
	archived: boolean,
	updatedAt: number,
): Promise<void> => {
	await database.runAsync(
		`UPDATE ${tableName} SET archived = ?, updated_at = ? WHERE id = ?;`,
		archived ? 1 : 0,
		updatedAt,
		id,
	);
};

const simpleEntityNameExistsRow = async (
	database: SQLiteDatabase,
	tableName: "trips" | "investments",
	name: string,
	excludeId?: string,
): Promise<boolean> => {
	const row = excludeId
		? await database.getFirstAsync<Pick<SimpleEntity, "id">>(
				`
					SELECT id FROM ${tableName}
					WHERE lower(name) = lower(?)
						AND COALESCE(archived, 0) = 0
						AND id != ?
					LIMIT 1;
				`,
				name,
				excludeId,
			)
		: await database.getFirstAsync<Pick<SimpleEntity, "id">>(
				`
					SELECT id FROM ${tableName}
					WHERE lower(name) = lower(?)
						AND COALESCE(archived, 0) = 0
					LIMIT 1;
				`,
				name,
			);
	return row !== null;
};

const getTransactionMinMaxDate = async (
	database: SQLiteDatabase,
): Promise<TransactionDateBounds | null> =>
	database.getFirstAsync<TransactionDateBounds>(
		`SELECT MIN(transaction_at) AS minDate, MAX(transaction_at) AS maxDate FROM transactions;`,
	);

const getTransactionRows = async (
	database: SQLiteDatabase,
	start?: number,
	end?: number,
): Promise<readonly Transaction[]> =>
	hydrateTransactionItems(
		database,
		await database.getAllAsync<Omit<Transaction, "items">>(
			start === undefined || end === undefined
				? `${TRANSACTION_SELECT} ORDER BY t.transaction_at DESC, t.created_at DESC;`
				: `${TRANSACTION_SELECT} WHERE t.transaction_at BETWEEN ? AND ? ORDER BY t.transaction_at DESC, t.created_at DESC;`,
			...(start === undefined || end === undefined ? [] : [start, end]),
		),
	);

const getTransactionPageRows = async (
	database: SQLiteDatabase,
	limit: number,
	cursor?: TransactionCursor,
	classification?: TransactionClassification,
): Promise<readonly Transaction[]> => {
	const conditions = [
		...(cursor ? ["(t.created_at, t.id) < (?, ?)"] : []),
		...(classification ? ["t.classification = ?"] : []),
	];
	const parameters = [
		...(cursor ? [cursor.createdAt, cursor.id] : []),
		...(classification ? [classification] : []),
	];
	return hydrateTransactionItems(
		database,
		await database.getAllAsync<Omit<Transaction, "items">>(
			`${TRANSACTION_SELECT}
			${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
			ORDER BY t.created_at DESC, t.id DESC LIMIT ?;`,
			...parameters,
			limit,
		),
	);
};

const getCategoryAnalysisRows = async (
	database: SQLiteDatabase,
	start: number,
	end: number,
): Promise<readonly CategoryAnalysisRow[]> =>
	database.getAllAsync<CategoryAnalysisRow>(
		`
		SELECT
			category.id AS categoryId,
			category.name AS categoryName,
			category.is_income AS isIncome,
			allocation.currencyCode AS currencyCode,
			SUM(CASE WHEN allocation.type = 'CREDIT' THEN CAST(allocation.amount AS REAL) ELSE 0 END) AS credits,
			SUM(CASE WHEN allocation.type = 'DEBIT' THEN CAST(allocation.amount AS REAL) ELSE 0 END) AS debits
		FROM (
			SELECT item.category_id AS categoryId, item.amount AS amount,
				t.type AS type, source.currency_code AS currencyCode
			FROM transaction_items item
			INNER JOIN transactions t ON t.id = item.transaction_id
			INNER JOIN sources source ON source.id = t.source_id
			WHERE t.classification = 'GENERAL' AND t.type = 'DEBIT'
				AND t.transaction_at BETWEEN ? AND ?
			UNION ALL
			SELECT t.category_id, t.amount, t.type, source.currency_code
			FROM transactions t
			INNER JOIN sources source ON source.id = t.source_id
			WHERE t.classification = 'GENERAL' AND t.type = 'CREDIT'
				AND t.category_id IS NOT NULL
				AND t.transaction_at BETWEEN ? AND ?
		) allocation
		INNER JOIN categories category ON category.id = allocation.categoryId
		WHERE COALESCE(category.archived, 0) = 0
		GROUP BY category.id, allocation.currencyCode
		ORDER BY category.id, allocation.currencyCode;
	`,
		start,
		end,
		start,
		end,
	);

const getInvestmentAnalysisRows = async (
	database: SQLiteDatabase,
	start: number,
	end: number,
): Promise<readonly InvestmentAnalysisRow[]> =>
	database.getAllAsync<InvestmentAnalysisRow>(
		`
		SELECT
			investment.id AS investmentId,
			investment.name AS investmentName,
			source.currency_code AS currencyCode,
			SUM(CASE WHEN t.type = 'DEBIT' THEN CAST(t.amount AS REAL) ELSE 0 END) AS totalInvested,
			SUM(CASE WHEN t.type = 'CREDIT' THEN CAST(t.amount AS REAL) ELSE 0 END) AS totalRedeemed
		FROM transactions t
		INNER JOIN investments investment ON investment.id = t.investment_id
		INNER JOIN sources source ON source.id = t.source_id
		WHERE t.classification = 'INVESTMENT'
			AND COALESCE(investment.archived, 0) = 0
			AND t.transaction_at BETWEEN ? AND ?
		GROUP BY investment.id, source.currency_code
		ORDER BY investment.id, source.currency_code;
	`,
		start,
		end,
	);

const getTripTotalRows = async (
	database: SQLiteDatabase,
): Promise<readonly TripTotalRow[]> =>
	database.getAllAsync<TripTotalRow>(`
		SELECT
			t.trip_id AS tripId,
			source.currency_code AS currencyCode,
			SUM(CASE WHEN t.type = 'CREDIT' THEN CAST(t.amount AS REAL) ELSE 0 END) AS credits,
			SUM(CASE WHEN t.type = 'DEBIT' THEN CAST(t.amount AS REAL) ELSE 0 END) AS debits
		FROM transactions t
		INNER JOIN sources source ON source.id = t.source_id
		WHERE t.classification = 'GENERAL'
			AND t.type != 'TRANSFER'
			AND t.trip_id IS NOT NULL
		GROUP BY t.trip_id, source.currency_code
		ORDER BY source.currency_code, t.trip_id;
	`);

const getTransactionCurrencyRows = async (
	database: SQLiteDatabase,
	start: number,
	end: number,
): Promise<readonly Pick<Source, "currencyCode">[]> =>
	database.getAllAsync<Pick<Source, "currencyCode">>(
		`
		SELECT DISTINCT source.currency_code AS currencyCode
		FROM transactions t
		INNER JOIN sources source ON source.id = t.source_id
		WHERE t.type != 'TRANSFER'
			AND t.transaction_at BETWEEN ? AND ?
		ORDER BY currencyCode;
	`,
		start,
		end,
	);

const getTransactionRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Transaction | null> => {
	const row = await database.getFirstAsync<Omit<Transaction, "items">>(
		`${TRANSACTION_SELECT} WHERE t.id = ?;`,
		id,
	);
	const [transaction] = await hydrateTransactionItems(
		database,
		row ? [row] : [],
	);
	return transaction ?? null;
};

const getTransactionItemRows = async (
	database: SQLiteDatabase,
	transactionIds: readonly string[],
): Promise<readonly TransactionItem[]> => {
	const items: TransactionItem[] = [];
	for (let offset = 0; offset < transactionIds.length; offset += 500) {
		const ids = transactionIds.slice(offset, offset + 500);
		items.push(
			...(await database.getAllAsync<TransactionItem>(
				`SELECT item.id, item.transaction_id AS transactionId, item.category_id AS categoryId,
			 category.name AS categoryName, item.amount, item.position,
			 item.created_at AS createdAt, item.updated_at AS updatedAt
			 FROM transaction_items item JOIN categories category ON category.id = item.category_id
			 WHERE item.transaction_id IN (${ids.map(() => "?").join(", ")})
			 ORDER BY item.transaction_id, item.position;`,
				...ids,
			)),
		);
	}
	return items;
};

const hydrateTransactionItems = async (
	database: SQLiteDatabase,
	transactions: readonly Omit<Transaction, "items">[],
): Promise<readonly Transaction[]> => {
	const expenseIds = transactions
		.filter(
			(transaction) =>
				transaction.classification === "GENERAL" &&
				transaction.type === "DEBIT",
		)
		.map((transaction) => transaction.id);
	const items = await getTransactionItemRows(database, expenseIds);
	const itemsByTransaction = new Map<string, TransactionItem[]>();
	for (const item of items) {
		const siblings = itemsByTransaction.get(item.transactionId) ?? [];
		siblings.push(item);
		itemsByTransaction.set(item.transactionId, siblings);
	}
	return transactions.map((transaction) => ({
		...transaction,
		items: itemsByTransaction.get(transaction.id) ?? [],
	}));
};

const createTransactionItemRow = async (
	database: SQLiteDatabase,
	item: Omit<TransactionItem, "categoryName">,
): Promise<void> => {
	await database.runAsync(
		`INSERT INTO transaction_items (id, transaction_id, category_id, amount, position, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?);`,
		item.id,
		item.transactionId,
		item.categoryId,
		item.amount,
		item.position,
		item.createdAt,
		item.updatedAt,
	);
};

const deleteTransactionItemRows = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	await database.runAsync(
		"DELETE FROM transaction_items WHERE transaction_id = ?;",
		id,
	);
};

const createTransactionRow = async (
	database: SQLiteDatabase,
	transaction: TransactionInput,
	id: string,
	now: number,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO transactions (
				id, classification, type, source_id, destination_source_id,
				amount, to_amount, category_id, trip_id, investment_id,
				reason, transaction_at, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
		`,
		id,
		transaction.classification,
		transaction.type,
		transaction.sourceId,
		transaction.destinationSourceId ?? null,
		transaction.amount,
		transaction.toAmount ?? null,
		transaction.categoryId ?? null,
		transaction.tripId ?? null,
		transaction.investmentId ?? null,
		transaction.reason,
		transaction.transactionAt,
		now,
		now,
	);
};

const updateTransactionRow = async (
	database: SQLiteDatabase,
	transaction: TransactionInput,
	id: string,
	now: number,
): Promise<void> => {
	await database.runAsync(
		`
			UPDATE transactions SET
				classification = ?,
				type = ?,
				source_id = ?,
				destination_source_id = ?,
				amount = ?,
				to_amount = ?,
				category_id = ?,
				trip_id = ?,
				investment_id = ?,
				reason = ?,
				transaction_at = ?,
				updated_at = ?
			WHERE id = ?;
		`,
		transaction.classification,
		transaction.type,
		transaction.sourceId,
		transaction.destinationSourceId ?? null,
		transaction.amount,
		transaction.toAmount ?? null,
		transaction.categoryId ?? null,
		transaction.tripId ?? null,
		transaction.investmentId ?? null,
		transaction.reason,
		transaction.transactionAt,
		now,
		id,
	);
};

const deleteTransactionRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	await database.withTransactionAsync(async (): Promise<void> => {
		await database.runAsync(
			"DELETE FROM attachments WHERE owner_type = 'TRANSACTION' AND owner_id = ?;",
			id,
		);
		await database.runAsync(
			"DELETE FROM transaction_items WHERE transaction_id = ?;",
			id,
		);
		await database.runAsync("DELETE FROM transactions WHERE id = ?;", id);
	});
};

const getBudgetRows = async (
	database: SQLiteDatabase,
): Promise<readonly Budget[]> =>
	database.getAllAsync<Budget>(`
		SELECT
			budget.id,
			budget.category_id AS categoryId,
			category.name AS categoryName,
			budget.amount,
			budget.period,
			budget.created_at AS createdAt,
			budget.updated_at AS updatedAt
		FROM budgets budget
		INNER JOIN categories category ON category.id = budget.category_id
		ORDER BY lower(category.name), budget.period;
	`);

const getBudgetRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Budget | null> =>
	database.getFirstAsync<Budget>(
		`
			SELECT
				budget.id,
				budget.category_id AS categoryId,
				category.name AS categoryName,
				budget.amount,
				budget.period,
				budget.created_at AS createdAt,
				budget.updated_at AS updatedAt
			FROM budgets budget
			INNER JOIN categories category ON category.id = budget.category_id
			WHERE budget.id = ?;
		`,
		id,
	);

const upsertBudgetRow = async (
	database: SQLiteDatabase,
	budget: Budget,
): Promise<void> => {
	const result = await database.runAsync(
		`UPDATE budgets SET category_id = ?, amount = ?, period = ?, updated_at = ? WHERE id = ?;`,
		budget.categoryId,
		budget.amount,
		budget.period,
		budget.updatedAt,
		budget.id,
	);
	if (result.changes > 0) return;
	await database.runAsync(
		`
			INSERT INTO budgets (
				id, category_id, amount, period, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?);
		`,
		budget.id,
		budget.categoryId,
		budget.amount,
		budget.period,
		budget.createdAt,
		budget.updatedAt,
	);
};

const deleteBudgetRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	await database.runAsync("DELETE FROM budgets WHERE id = ?;", id);
};

const getExchangeRateRows = async (
	database: SQLiteDatabase,
): Promise<readonly ExchangeRate[]> =>
	database.getAllAsync<ExchangeRate>(`
		SELECT
			currency_code AS currencyCode,
			rate_to_inr AS rateToInr,
			source,
			fetched_at AS fetchedAt,
			updated_at AS updatedAt
		FROM exchange_rates
		ORDER BY currency_code;
	`);

const upsertExchangeRateRow = async (
	database: SQLiteDatabase,
	rate: ExchangeRate,
): Promise<void> => {
	const result = await database.runAsync(
		`UPDATE exchange_rates SET rate_to_inr = ?, source = ?, fetched_at = ?, updated_at = ? WHERE currency_code = ?;`,
		rate.rateToInr,
		rate.source,
		rate.fetchedAt,
		rate.updatedAt,
		rate.currencyCode,
	);
	if (result.changes > 0) return;
	await database.runAsync(
		`
			INSERT INTO exchange_rates (
				currency_code, rate_to_inr, source, fetched_at, updated_at
			) VALUES (?, ?, ?, ?, ?);
		`,
		rate.currencyCode,
		rate.rateToInr,
		rate.source,
		rate.fetchedAt,
		rate.updatedAt,
	);
};

const financeRepository = {
	categoryNameExistsRow,
	createSourceRow,
	createTransactionRow,
	createTransactionItemRow,
	deleteBudgetRow,
	deleteCategoryRow,
	deleteSimpleEntityRow,
	deleteSourceRow,
	deleteTransactionRow,
	deleteTransactionItemRows,
	getArchivedCategoryRows,
	getArchivedInvestmentRows,
	getArchivedSourceRows,
	getArchivedTripRows,
	getBudgetRow,
	getBudgetRows,
	getCategoryAnalysisRows,
	getCategoryRow,
	getCategoryRows,
	getExchangeRateRows,
	getInvestmentAnalysisRows,
	getInvestmentRow,
	getInvestmentRows,
	getInvestmentTypeRows,
	getSourceRow,
	getSourceRows,
	getTransactionCurrencyRows,
	getTransactionMinMaxDate,
	getTransactionItemRows,
	getTransactionPageRows,
	getTransactionRow,
	getTransactionRows,
	getTripRow,
	getTripRows,
	getTripTotalRows,
	investmentTypeNameExistsRow,
	setCategoryArchivedRow,
	setSimpleEntityArchivedRow,
	setSourceArchivedRow,
	simpleEntityNameExistsRow,
	sourceNameExistsRow,
	updateSourceNameRow,
	updateTransactionRow,
	upsertBudgetRow,
	upsertCategoryRow,
	upsertExchangeRateRow,
	upsertInvestmentRow,
	upsertInvestmentTypeRow,
	upsertSimpleEntityRow,
	validateSourceRow,
};

export default financeRepository;
