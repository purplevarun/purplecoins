import type { SQLiteDatabase } from "expo-sqlite";

import type { Budget } from "@/types/Budget";
import type { Category } from "@/types/Category";
import type { ExchangeRate } from "@/types/ExchangeRate";
import type { Investment } from "@/types/Investment";
import type { SimpleEntity } from "@/types/SimpleEntity";
import type { Source } from "@/types/Source";
import type { Transaction } from "@/types/Transaction";
import type { TransactionInput } from "@/types/TransactionInput";
import type { Trip } from "@/types/Trip";

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
		? await database.getFirstAsync<{ id: string }>(
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
		: await database.getFirstAsync<{ id: string }>(
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
): Promise<readonly Category[]> =>
	database.getAllAsync<Category>(`
		SELECT
			category.id,
			category.name,
			category.is_income AS isIncome,
			category.created_at AS createdAt,
			category.updated_at AS updatedAt,
			COALESCE(category.archived, 0) AS archived
		FROM categories category
		LEFT JOIN transactions txn ON txn.category_id = category.id
		WHERE COALESCE(category.archived, 0) = 0
		GROUP BY category.id
		ORDER BY
			COUNT(txn.id) DESC,
			COALESCE(MAX(txn.created_at), 0) DESC,
			lower(category.name) ASC;
	`);

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
	await database.runAsync(
		`
			INSERT INTO categories (
				id, name, is_income, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				name = excluded.name,
				is_income = excluded.is_income,
				updated_at = excluded.updated_at;
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
		? await database.getFirstAsync<{ id: string }>(
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
		: await database.getFirstAsync<{ id: string }>(
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
			trip.created_at AS createdAt,
			trip.updated_at AS updatedAt,
			COALESCE(trip.archived, 0) AS archived
		FROM trips trip
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
			created_at AS createdAt,
			updated_at AS updatedAt,
			COALESCE(archived, 0) AS archived
		FROM trips
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
				id, name, created_at AS createdAt, updated_at AS updatedAt,
				COALESCE(archived, 0) AS archived
			FROM trips
			WHERE id = ?;
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
			investment.created_at AS createdAt,
			investment.updated_at AS updatedAt,
			COALESCE(investment.archived, 0) AS archived
		FROM investments investment
		LEFT JOIN transactions txn ON txn.investment_id = investment.id
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
			id,
			name,
			created_at AS createdAt,
			updated_at AS updatedAt,
			COALESCE(archived, 0) AS archived
		FROM investments
		WHERE COALESCE(archived, 0) = 1
		ORDER BY lower(name) ASC;
	`);

const getInvestmentRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Investment | null> =>
	database.getFirstAsync<Investment>(
		`
			SELECT
				id, name, created_at AS createdAt, updated_at AS updatedAt,
				COALESCE(archived, 0) AS archived
			FROM investments
			WHERE id = ?;
		`,
		id,
	);

const upsertSimpleEntityRow = async (
	database: SQLiteDatabase,
	tableName: "trips" | "investments",
	entity: SimpleEntity,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO ${tableName} (id, name, created_at, updated_at)
			VALUES (?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				name = excluded.name,
				updated_at = excluded.updated_at;
		`,
		entity.id,
		entity.name,
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
		? await database.getFirstAsync<{ id: string }>(
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
		: await database.getFirstAsync<{ id: string }>(
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
): Promise<{ minDate: number; maxDate: number } | null> =>
	database.getFirstAsync<{ minDate: number; maxDate: number }>(
		`SELECT MIN(transaction_at) AS minDate, MAX(transaction_at) AS maxDate FROM transactions;`,
	);

const getTransactionRows = async (
	database: SQLiteDatabase,
): Promise<readonly Transaction[]> =>
	database.getAllAsync<Transaction>(
		`${TRANSACTION_SELECT} ORDER BY t.transaction_at DESC, t.created_at DESC;`,
	);

const getTransactionRowsInRange = async (
	database: SQLiteDatabase,
	start: number,
	end: number,
): Promise<readonly Transaction[]> =>
	database.getAllAsync<Transaction>(
		`
			${TRANSACTION_SELECT}
			WHERE t.transaction_at BETWEEN ? AND ?
			ORDER BY t.transaction_at DESC, t.created_at DESC;
		`,
		start,
		end,
	);

const getTransactionRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Transaction | null> =>
	database.getFirstAsync<Transaction>(
		`${TRANSACTION_SELECT} WHERE t.id = ?;`,
		id,
	);

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
	await database.runAsync(
		`
			INSERT INTO budgets (
				id, category_id, amount, period, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				category_id = excluded.category_id,
				amount = excluded.amount,
				period = excluded.period,
				updated_at = excluded.updated_at;
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
	await database.runAsync(
		`
			INSERT INTO exchange_rates (
				currency_code, rate_to_inr, source, fetched_at, updated_at
			) VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(currency_code) DO UPDATE SET
				rate_to_inr = excluded.rate_to_inr,
				source = excluded.source,
				fetched_at = excluded.fetched_at,
				updated_at = excluded.updated_at;
		`,
		rate.currencyCode,
		rate.rateToInr,
		rate.source,
		rate.fetchedAt,
		rate.updatedAt,
	);
};

export {
	categoryNameExistsRow,
	createSourceRow,
	createTransactionRow,
	deleteBudgetRow,
	deleteCategoryRow,
	deleteSimpleEntityRow,
	deleteSourceRow,
	deleteTransactionRow,
	getArchivedCategoryRows,
	getArchivedInvestmentRows,
	getArchivedSourceRows,
	getArchivedTripRows,
	getBudgetRow,
	getBudgetRows,
	getCategoryRow,
	getCategoryRows,
	getExchangeRateRows,
	getInvestmentRow,
	getInvestmentRows,
	getSourceRow,
	getSourceRows,
	getTransactionMinMaxDate,
	getTransactionRow,
	getTransactionRows,
	getTransactionRowsInRange,
	getTripRow,
	getTripRows,
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
	upsertSimpleEntityRow,
	validateSourceRow,
};
