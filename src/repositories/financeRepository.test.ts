import financeRepository from "@/repositories/financeRepository";

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
} = financeRepository;

describe("financeRepository", () => {
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
		expect(await getArchivedInvestmentRows(database)).toEqual([{ id: "i2" }]);

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
				.mockResolvedValueOnce([{ id: "tx2" }])
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
		expect(await getTransactionRows(database)).toEqual([{ id: "tx1" }]);
		expect(await getTransactionRowsInRange(database, 1, 2)).toEqual([{ id: "tx2" }]);
		expect(await getTransactionRow(database, "tx1")).toEqual({ id: "tx1" });
		expect(await getBudgetRows(database)).toEqual([{ id: "b1" }]);
		expect(await getBudgetRow(database, "b1")).toEqual({ id: "b1" });
		expect(await getExchangeRateRows(database)).toEqual([{ currencyCode: "USD" }]);
	});

	it("writes source/category/simple-entity rows and checks names", async () => {
		const database = {
			runAsync: vi.fn(async () => {}),
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
			1,
			2,
		);

		await setSimpleEntityArchivedRow(database, "investments", "inv1", true, 10);
		await setSimpleEntityArchivedRow(database, "investments", "inv1", false, 11);
		expect(await simpleEntityNameExistsRow(database, "trips", "Goa", "tr1")).toBe(
			true,
		);
		expect(await simpleEntityNameExistsRow(database, "investments", "Nope")).toBe(
			false,
		);
	});

	it("writes and deletes transaction, budget and misc rows", async () => {
		const database = {
			runAsync: vi.fn(async () => {}),
			withTransactionAsync: vi.fn(async (callback: () => Promise<void>) => {
				await callback();
			}),
		} as any;

		await createTransactionRow(
			database,
			{
				classification: "EXPENSE",
				type: "TRANSFER",
				sourceId: "s1",
				destinationSourceId: null,
				amount: "10",
				toAmount: null,
				categoryId: null,
				tripId: null,
				investmentId: null,
				reason: "r",
				transactionAt: 100,
			},
			"tx1",
			111,
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO transactions"),
			"tx1",
			"EXPENSE",
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
				classification: "INCOME",
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
			"INCOME",
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
			source: "api",
			fetchedAt: 1,
			updatedAt: 2,
		});
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO exchange_rates"),
			"USD",
			"83.5",
			"api",
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
});
