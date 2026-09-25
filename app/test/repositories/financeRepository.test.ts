import financeRepository from "@/repositories/financeRepository";
import type TestAsyncFunction from "@test/types/TestAsyncFunction";

import type { SQLiteDatabase } from "expo-sqlite";
import { describe, expect, it, vi } from "vitest";

const {
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
	getInvestmentTypeRows,
	getSourceRow,
	getSourceRows,
	getCategoryAnalysisRows,
	getInvestmentAnalysisRows,
	getTransactionCurrencyRows,
	getTransactionMinMaxDate,
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
} = financeRepository;

describe("financeRepository", () => {
	it("loads ordered items in a batch without duplicating payment headers", async () => {
		const headers = [
			{
				id: "expense",
				classification: "GENERAL",
				type: "DEBIT",
				amount: "200",
			},
			{
				id: "income",
				classification: "GENERAL",
				type: "CREDIT",
				amount: "300",
			},
		];
		const items = [
			{
				id: "first",
				transactionId: "expense",
				categoryId: "food",
				amount: "100",
				position: 0,
			},
			{
				id: "second",
				transactionId: "expense",
				categoryId: "grocery",
				amount: "100",
				position: 1,
			},
		];
		const getAllAsync = vi
			.fn()
			.mockResolvedValueOnce(headers)
			.mockResolvedValueOnce(items);
		const database = { getAllAsync } as unknown as SQLiteDatabase;
		expect(await getTransactionPageRows(database, 2)).toEqual([
			{ ...headers[0], items },
			{ ...headers[1], items: [] },
		]);
		expect(getAllAsync).toHaveBeenLastCalledWith(
			expect.stringContaining(
				"ORDER BY item.transaction_id, item.position",
			),
			"expense",
		);
	});

	it("chunks large item lookups and handles missing payments", async () => {
		const getAllAsync = vi.fn().mockResolvedValue([]);
		const getFirstAsync = vi.fn().mockResolvedValue(null);
		const database = {
			getAllAsync,
			getFirstAsync,
		} as unknown as SQLiteDatabase;
		await financeRepository.getTransactionItemRows(
			database,
			Array.from({ length: 501 }, (_, index) => `payment-${index}`),
		);
		expect(getAllAsync).toHaveBeenCalledTimes(2);
		expect(getAllAsync.mock.calls[0]).toHaveLength(501);
		expect(getAllAsync.mock.calls[1]).toHaveLength(2);
		expect(await getTransactionRow(database, "missing")).toBeNull();
	});

	it("writes and replaces item rows without opening a nested transaction", async () => {
		const runAsync = vi.fn().mockResolvedValue(undefined);
		const database = { runAsync } as unknown as SQLiteDatabase;
		await financeRepository.createTransactionItemRow(database, {
			id: "item",
			transactionId: "payment",
			categoryId: "food",
			amount: "100",
			position: 0,
			createdAt: 1,
			updatedAt: 2,
		});
		expect(runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO transaction_items"),
			"item",
			"payment",
			"food",
			"100",
			0,
			1,
			2,
		);
		await financeRepository.deleteTransactionItemRows(database, "payment");
		expect(runAsync).toHaveBeenLastCalledWith(
			"DELETE FROM transaction_items WHERE transaction_id = ?;",
			"payment",
		);
	});

	it.each([
		{ cursor: undefined, classification: undefined },
		{
			cursor: {
				createdAt: 100,
				id: "00000000-0000-4000-8000-000000000010",
			},
			classification: undefined,
		},
		{ cursor: undefined, classification: "INVESTMENT" as const },
		{
			cursor: {
				createdAt: 100,
				id: "00000000-0000-4000-8000-000000000010",
			},
			classification: "GENERAL" as const,
		},
	])(
		"queries a count-limited creation-ordered page with cursor $cursor and classification $classification",
		async ({ cursor, classification }) => {
			const getAllAsync = vi
				.fn<
					(
						sql: string,
						...parameters: (string | number)[]
					) => Promise<readonly unknown[]>
				>()
				.mockResolvedValue([]);
			const database = { getAllAsync } as unknown as SQLiteDatabase;

			expect(
				await getTransactionPageRows(
					database,
					11,
					cursor,
					classification,
				),
			).toEqual([]);
			expect(getAllAsync).toHaveBeenCalledExactlyOnceWith(
				expect.stringContaining(
					"ORDER BY t.created_at DESC, t.id DESC LIMIT ?;",
				),
				...(cursor ? [cursor.createdAt, cursor.id] : []),
				...(classification ? [classification] : []),
				11,
			);
			const sql = getAllAsync.mock.calls[0]?.[0];
			expect(sql).not.toContain("transaction_at BETWEEN");
			expect(sql).not.toContain("OFFSET");
			if (cursor && classification) {
				expect(sql).toContain(
					"WHERE (t.created_at, t.id) < (?, ?) AND t.classification = ?",
				);
			}
			if (cursor)
				expect(sql).toContain("WHERE (t.created_at, t.id) < (?, ?)");
			else expect(sql).not.toContain("(t.created_at, t.id)");
			if (classification && !cursor)
				expect(sql).toContain("WHERE t.classification = ?");
			if (!classification)
				expect(sql).not.toContain("t.classification = ?");
		},
	);

	it("aggregates category credits and debits per currency in SQL", async () => {
		const rows = [
			{
				categoryId: "rent",
				categoryName: "Rent",
				isIncome: 0,
				currencyCode: "INR",
				credits: 0,
				debits: 27000,
			},
		];
		const getAllAsync = vi.fn().mockResolvedValue(rows);
		const database = { getAllAsync } as unknown as SQLiteDatabase;

		expect(await getCategoryAnalysisRows(database, 1, 2)).toEqual(rows);
		expect(getAllAsync).toHaveBeenCalledExactlyOnceWith(
			expect.stringContaining("GROUP BY category.id"),
			1,
			2,
			1,
			2,
		);
		const sql = getAllAsync.mock.calls[0]?.[0] as string;
		expect(sql).toContain("UNION ALL");
		expect(sql).toContain(
			"t.classification = 'GENERAL' AND t.type = 'DEBIT'",
		);
		expect(sql).toContain(
			"t.classification = 'GENERAL' AND t.type = 'CREDIT'",
		);
		expect(sql).toContain("t.category_id IS NOT NULL");
		expect(sql).toContain(
			"INNER JOIN transactions t ON t.id = item.transaction_id",
		);
		expect(sql).toContain("WHERE COALESCE(category.archived, 0) = 0");
		expect(sql.match(/t\.transaction_at BETWEEN \? AND \?/g)).toHaveLength(
			2,
		);
	});

	it("aggregates invested and redeemed totals per investment currency in SQL", async () => {
		const rows = [
			{
				investmentId: "mf",
				investmentName: "Fund",
				currencyCode: "INR",
				totalInvested: 10000,
				totalRedeemed: 2500,
			},
		];
		const getAllAsync = vi.fn().mockResolvedValue(rows);
		const database = { getAllAsync } as unknown as SQLiteDatabase;

		expect(await getInvestmentAnalysisRows(database, 3, 4)).toEqual(rows);
		expect(getAllAsync).toHaveBeenCalledExactlyOnceWith(
			expect.stringContaining(
				"GROUP BY investment.id, source.currency_code",
			),
			3,
			4,
		);
		const sql = getAllAsync.mock.calls[0]?.[0] as string;
		expect(sql).toContain("t.classification = 'INVESTMENT'");
		expect(sql).toContain("COALESCE(investment.archived, 0) = 0");
		expect(sql).toContain("t.transaction_at BETWEEN ? AND ?");
	});

	it("aggregates trip credits and debits per currency in SQL", async () => {
		const rows = [
			{
				tripId: "goa",
				currencyCode: "INR",
				credits: 40,
				debits: 100,
			},
		];
		const getAllAsync = vi.fn().mockResolvedValue(rows);
		const database = { getAllAsync } as unknown as SQLiteDatabase;

		expect(await getTripTotalRows(database)).toEqual(rows);
		expect(getAllAsync).toHaveBeenCalledExactlyOnceWith(
			expect.stringContaining("GROUP BY t.trip_id, source.currency_code"),
		);
		const sql = getAllAsync.mock.calls[0]?.[0] as string;
		expect(sql).toContain("t.classification = 'GENERAL'");
		expect(sql).toContain("t.type != 'TRANSFER'");
		expect(sql).toContain("t.trip_id IS NOT NULL");
		expect(sql).toContain("ORDER BY source.currency_code, t.trip_id");
	});

	it("lists distinct non-transfer transaction currencies in SQL", async () => {
		const getAllAsync = vi
			.fn()
			.mockResolvedValue([{ currencyCode: "EUR" }]);
		const database = { getAllAsync } as unknown as SQLiteDatabase;

		expect(await getTransactionCurrencyRows(database, 5, 6)).toEqual([
			{ currencyCode: "EUR" },
		]);
		expect(getAllAsync).toHaveBeenCalledExactlyOnceWith(
			expect.stringContaining(
				"SELECT DISTINCT source.currency_code AS currencyCode",
			),
			5,
			6,
		);
		const sql = getAllAsync.mock.calls[0]?.[0] as string;
		expect(sql).toContain("t.type != 'TRANSFER'");
		expect(sql).toContain("t.transaction_at BETWEEN ? AND ?");
		expect(sql).toContain("ORDER BY currencyCode");
	});

	it.each([true, false])(
		"filters active categories by isIncome=%s in SQL",
		async (isIncome) => {
			const getAllAsync = vi.fn().mockResolvedValue([]);
			const database = { getAllAsync } as unknown as SQLiteDatabase;

			expect(await getCategoryRows(database, isIncome)).toEqual([]);
			expect(getAllAsync).toHaveBeenCalledExactlyOnceWith(
				expect.stringContaining("AND category.is_income = ?"),
				Number(isIncome),
			);
		},
	);

	it("bounds transaction rows in SQL and keeps newest-first ordering", async () => {
		const getAllAsync = vi.fn().mockResolvedValue([]);
		const database = { getAllAsync } as unknown as SQLiteDatabase;

		expect(await getTransactionRows(database, 100, 200)).toEqual([]);
		expect(getAllAsync).toHaveBeenCalledWith(
			expect.stringContaining(
				"WHERE t.transaction_at BETWEEN ? AND ? ORDER BY t.transaction_at DESC, t.created_at DESC;",
			),
			100,
			200,
		);
	});

	it("queries source/category/trip/investment rows", async () => {
		const database = {
			getAllAsync: vi
				.fn()
				.mockResolvedValueOnce([{ id: "s1" }])
				.mockResolvedValueOnce([{ id: "s2" }])
				.mockResolvedValueOnce([{ id: "c1" }])
				.mockResolvedValueOnce([{ id: "c2" }])
				.mockResolvedValueOnce([{ id: "t1" }])
				.mockResolvedValueOnce([{ id: "t2" }])
				.mockResolvedValueOnce([{ id: "i1" }])
				.mockResolvedValueOnce([{ id: "i2" }]),
			getFirstAsync: vi
				.fn()
				.mockResolvedValueOnce({ id: "s1" })
				.mockResolvedValueOnce({ id: "c1" })
				.mockResolvedValueOnce({ id: "t1" })
				.mockResolvedValueOnce({ id: "i1" }),
		} as any;

		expect(await getSourceRows(database)).toEqual([{ id: "s1" }]);
		expect(await getArchivedSourceRows(database)).toEqual([{ id: "s2" }]);
		expect(await getCategoryRows(database)).toEqual([{ id: "c1" }]);
		expect(await getArchivedCategoryRows(database)).toEqual([{ id: "c2" }]);
		expect(await getTripRows(database)).toEqual([{ id: "t1" }]);
		expect(await getArchivedTripRows(database)).toEqual([{ id: "t2" }]);
		expect(await getInvestmentRows(database)).toEqual([{ id: "i1" }]);
		expect(await getArchivedInvestmentRows(database)).toEqual([
			{ id: "i2" },
		]);

		expect(await getSourceRow(database, "s1")).toEqual({ id: "s1" });
		expect(await getCategoryRow(database, "c1")).toEqual({ id: "c1" });
		expect(await getTripRow(database, "t1")).toEqual({ id: "t1" });
		expect(await getInvestmentRow(database, "i1")).toEqual({ id: "i1" });
	});

	it("queries transaction/budget/exchange-rate rows", async () => {
		const database = {
			getAllAsync: vi
				.fn()
				.mockResolvedValueOnce([{ id: "tx1" }])
				.mockResolvedValueOnce([{ id: "b1" }])
				.mockResolvedValueOnce([{ currencyCode: "USD" }]),
			getFirstAsync: vi
				.fn()
				.mockResolvedValueOnce({ minDate: 10, maxDate: 20 })
				.mockResolvedValueOnce({ id: "tx1" })
				.mockResolvedValueOnce({ id: "b1" }),
		} as any;

		expect(await getTransactionMinMaxDate(database)).toEqual({
			minDate: 10,
			maxDate: 20,
		});
		expect(await getTransactionRows(database)).toEqual([
			{ id: "tx1", items: [] },
		]);
		expect(await getTransactionRow(database, "tx1")).toEqual({
			id: "tx1",
			items: [],
		});
		expect(await getBudgetRows(database)).toEqual([{ id: "b1" }]);
		expect(await getBudgetRow(database, "b1")).toEqual({ id: "b1" });
		expect(await getExchangeRateRows(database)).toEqual([
			{ currencyCode: "USD" },
		]);
	});

	it("writes source/category/simple-entity rows and checks names", async () => {
		const database = {
			runAsync: vi
				.fn<TestAsyncFunction>()
				.mockResolvedValue({ changes: 0 }),
			getFirstAsync: vi
				.fn()
				.mockResolvedValueOnce({ id: "x" })
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce({ id: "y" })
				.mockResolvedValueOnce(null)
				.mockResolvedValueOnce({ id: "z" })
				.mockResolvedValueOnce(null),
		} as any;

		await createSourceRow(database, {
			id: "s1",
			name: "Cash",
			currencyCode: "INR",
			validatedAt: null,
			createdAt: 1,
			updatedAt: 2,
			archived: false,
			latestTransactionCreatedAt: null,
			balance: "0",
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO sources"),
			"s1",
			"Cash",
			"INR",
			null,
			1,
			2,
		);

		await updateSourceNameRow(database, "s1", "Wallet", 3);
		expect(database.runAsync).toHaveBeenCalledWith(
			"UPDATE sources SET name = ?, updated_at = ? WHERE id = ?;",
			"Wallet",
			3,
			"s1",
		);

		await validateSourceRow(database, "s1", 4);
		expect(database.runAsync).toHaveBeenCalledWith(
			"UPDATE sources SET validated_at = ? WHERE id = ?;",
			4,
			"s1",
		);

		await setSourceArchivedRow(database, "s1", true, 5);
		await setSourceArchivedRow(database, "s1", false, 6);
		expect(database.runAsync).toHaveBeenCalledWith(
			"UPDATE sources SET archived = ?, updated_at = ? WHERE id = ?;",
			1,
			5,
			"s1",
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			"UPDATE sources SET archived = ?, updated_at = ? WHERE id = ?;",
			0,
			6,
			"s1",
		);

		expect(await sourceNameExistsRow(database, "Wallet", "s1")).toBe(true);
		expect(await sourceNameExistsRow(database, "Missing")).toBe(false);

		await upsertCategoryRow(database, {
			id: "c1",
			name: "Food",
			isIncome: false,
			createdAt: 1,
			updatedAt: 2,
			archived: false,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO categories"),
			"c1",
			"Food",
			0,
			1,
			2,
		);

		await upsertCategoryRow(database, {
			id: "c2",
			name: "Salary",
			isIncome: true,
			createdAt: 3,
			updatedAt: 4,
			archived: false,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO categories"),
			"c2",
			"Salary",
			1,
			3,
			4,
		);

		await setCategoryArchivedRow(database, "c1", true, 9);
		await setCategoryArchivedRow(database, "c1", false, 10);
		expect(await categoryNameExistsRow(database, "Food", "c1")).toBe(true);
		expect(await categoryNameExistsRow(database, "Missing")).toBe(false);

		await upsertSimpleEntityRow(database, "trips", {
			id: "tr1",
			name: "Goa",
			createdAt: 1,
			updatedAt: 2,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO trips"),
			"tr1",
			"Goa",
			null,
			1,
			2,
		);

		await setSimpleEntityArchivedRow(
			database,
			"investments",
			"inv1",
			true,
			10,
		);
		await setSimpleEntityArchivedRow(
			database,
			"investments",
			"inv1",
			false,
			11,
		);
		expect(
			await simpleEntityNameExistsRow(database, "trips", "Goa", "tr1"),
		).toBe(true);
		expect(
			await simpleEntityNameExistsRow(database, "investments", "Nope"),
		).toBe(false);
	});

	it("writes and deletes transaction, budget and misc rows", async () => {
		const database = {
			runAsync: vi
				.fn<TestAsyncFunction>()
				.mockResolvedValue({ changes: 0 }),
			withTransactionAsync: vi.fn(
				async (callback: () => Promise<void>) => {
					await callback();
				},
			),
		} as any;

		await createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: "s1",
				destinationSourceId: undefined,
				amount: "10",
				toAmount: undefined,
				categoryId: undefined,
				tripId: undefined,
				investmentId: undefined,
				reason: "r",
				transactionAt: 100,
			},
			"tx1",
			111,
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO transactions"),
			"tx1",
			"GENERAL",
			"TRANSFER",
			"s1",
			null,
			"10",
			null,
			null,
			null,
			null,
			"r",
			100,
			111,
			111,
		);

		await updateTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "CREDIT",
				sourceId: "s2",
				destinationSourceId: "s3",
				amount: "20",
				toAmount: "30",
				categoryId: "c1",
				tripId: "t1",
				investmentId: "i1",
				reason: "salary",
				transactionAt: 200,
			},
			"tx1",
			222,
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("UPDATE transactions SET"),
			"GENERAL",
			"CREDIT",
			"s2",
			"s3",
			"20",
			"30",
			"c1",
			"t1",
			"i1",
			"salary",
			200,
			222,
			"tx1",
		);

		await updateTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: "s4",
				destinationSourceId: undefined,
				amount: "5",
				toAmount: undefined,
				categoryId: undefined,
				tripId: undefined,
				investmentId: undefined,
				reason: "snack",
				transactionAt: 300,
			},
			"tx2",
			333,
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("UPDATE transactions SET"),
			"GENERAL",
			"DEBIT",
			"s4",
			null,
			"5",
			null,
			null,
			null,
			null,
			"snack",
			300,
			333,
			"tx2",
		);

		await deleteTransactionRow(database, "tx1");
		expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM attachments WHERE owner_type = 'TRANSACTION' AND owner_id = ?;",
			"tx1",
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM transactions WHERE id = ?;",
			"tx1",
		);

		await upsertBudgetRow(database, {
			id: "b1",
			categoryId: "c1",
			categoryName: "Food",
			amount: "100",
			period: "MONTHLY",
			createdAt: 1,
			updatedAt: 2,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO budgets"),
			"b1",
			"c1",
			"100",
			"MONTHLY",
			1,
			2,
		);

		await upsertExchangeRateRow(database, {
			currencyCode: "USD",
			rateToInr: "83.5",
			source: "API",
			fetchedAt: 1,
			updatedAt: 2,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO exchange_rates"),
			"USD",
			"83.5",
			"API",
			1,
			2,
		);

		await deleteSourceRow(database, "s1");
		await deleteCategoryRow(database, "c1");
		await deleteSimpleEntityRow(database, "trips", "t1");
		await deleteBudgetRow(database, "b1");
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM sources WHERE id = ?;",
			"s1",
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM categories WHERE id = ?;",
			"c1",
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM trips WHERE id = ?;",
			"t1",
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM budgets WHERE id = ?;",
			"b1",
		);
	});

	it("writes investment rows and manages investment types", async () => {
		const database = {
			runAsync: vi
				.fn<TestAsyncFunction>()
				.mockResolvedValue({ changes: 0 }),
			getAllAsync: vi.fn().mockResolvedValueOnce([{ id: "type1" }]),
			getFirstAsync: vi
				.fn()
				.mockResolvedValueOnce({ id: "type1" })
				.mockResolvedValueOnce(null),
		} as any;

		await upsertInvestmentRow(database, {
			id: "i1",
			name: "Fund A",
			platformId: "platform1",
			investmentTypeId: "type1",
			createdAt: 1,
			updatedAt: 2,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO investments"),
			"i1",
			"Fund A",
			"type1",
			"platform1",
			1,
			2,
		);

		expect(await getInvestmentTypeRows(database)).toEqual([
			{ id: "type1" },
		]);

		await upsertInvestmentTypeRow(database, {
			id: "type1",
			name: "Mutual Fund",
			createdAt: 3,
			updatedAt: 4,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO investment_types"),
			"type1",
			"Mutual Fund",
			3,
			4,
		);

		expect(await investmentTypeNameExistsRow(database, "Mutual Fund")).toBe(
			true,
		);
		expect(await investmentTypeNameExistsRow(database, "Nope")).toBe(false);
	});

	it("updates existing category, budget and exchange-rate rows without inserting", async () => {
		const database = {
			runAsync: vi
				.fn<TestAsyncFunction>()
				.mockResolvedValue({ changes: 1 }),
		} as any;

		await upsertCategoryRow(database, {
			id: "c1",
			name: "Food",
			isIncome: false,
			createdAt: 1,
			updatedAt: 2,
			archived: false,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("UPDATE categories"),
			"Food",
			0,
			2,
			"c1",
		);

		await upsertBudgetRow(database, {
			id: "b1",
			categoryId: "c1",
			categoryName: "Food",
			amount: "100",
			period: "MONTHLY",
			createdAt: 1,
			updatedAt: 2,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("UPDATE budgets"),
			"c1",
			"100",
			"MONTHLY",
			2,
			"b1",
		);

		await upsertExchangeRateRow(database, {
			currencyCode: "USD",
			rateToInr: "83.5",
			source: "API",
			fetchedAt: 1,
			updatedAt: 2,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("UPDATE exchange_rates"),
			"83.5",
			"API",
			1,
			2,
			"USD",
		);

		expect(database.runAsync).toHaveBeenCalledTimes(3);
	});
});
