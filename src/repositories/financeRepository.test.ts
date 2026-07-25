import financeRepository from "@/repositories/financeRepository";

import { beforeEach, describe, expect, it } from "vitest";

import attachmentRepository from "@/repositories/attachmentRepository";
import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type TransactionInput from "@/types/TransactionInput";
import type { SQLiteDatabase } from "expo-sqlite";

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
const { insertCategory, insertInvestment, insertSource, insertTrip } =
	dbFixtures;

const NOW = 1_780_000_000_000;

const buildTransactionInput = (
	overrides: Partial<TransactionInput> & Pick<TransactionInput, "sourceId">,
): TransactionInput => ({
	classification: "GENERAL",
	type: "DEBIT",
	amount: "100",
	reason: "Test reason",
	transactionAt: NOW,
	...overrides,
});

describe("financeRepository", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("sources", () => {
		it("creates and retrieves a source with a zero balance placeholder", async () => {
			const source = await insertSource(database, { name: "Bank" });

			const row = await getSourceRow(database, source.id);

			expect(row?.name).toBe("Bank");
			expect(row?.balance).toBe("0");
			expect(row?.archived).toBe(0);
		});

		it("excludes archived sources from getSourceRows and includes them in getArchivedSourceRows", async () => {
			const active = await insertSource(database, { name: "Active" });
			const archived = await insertSource(database, { name: "Archived" });
			await setSourceArchivedRow(database, archived.id, true, NOW);

			const activeRows = await getSourceRows(database);
			const archivedRows = await getArchivedSourceRows(database);

			expect(activeRows.map((row) => row.id)).toEqual([active.id]);
			expect(archivedRows.map((row) => row.id)).toEqual([archived.id]);
		});

		it("orders sources by usage, then recency, then name", async () => {
			await insertSource(database, { name: "Zeta" });
			await insertSource(database, { name: "Alpha" });

			const rows = await getSourceRows(database);

			expect(rows.map((row) => row.name)).toEqual(["Alpha", "Zeta"]);
		});

		it("updates a source name", async () => {
			const source = await insertSource(database, { name: "Old name" });

			await updateSourceNameRow(database, source.id, "New name", NOW);

			const row = await getSourceRow(database, source.id);
			expect(row?.name).toBe("New name");
			expect(row?.updatedAt).toBe(NOW);
		});

		it("stamps validatedAt via validateSourceRow", async () => {
			const source = await insertSource(database);

			await validateSourceRow(database, source.id, NOW);

			const row = await getSourceRow(database, source.id);
			expect(row?.validatedAt).toBe(NOW);
		});

		it("detects duplicate names case-insensitively, excluding archived and the given id", async () => {
			const source = await insertSource(database, { name: "Wallet" });

			expect(await sourceNameExistsRow(database, "WALLET")).toBe(true);
			expect(
				await sourceNameExistsRow(database, "wallet", source.id),
			).toBe(false);
			expect(await sourceNameExistsRow(database, "Nonexistent")).toBe(
				false,
			);
		});

		it("does not count archived sources as name collisions", async () => {
			const source = await insertSource(database, { name: "Wallet" });
			await setSourceArchivedRow(database, source.id, true, NOW);

			expect(await sourceNameExistsRow(database, "Wallet")).toBe(false);
		});

		it("deletes a source with no linked transactions", async () => {
			const source = await insertSource(database);

			await deleteSourceRow(database, source.id);

			expect(await getSourceRow(database, source.id)).toBeNull();
		});

		it("throws a foreign-key error deleting a source used by a transaction", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
				}),
				"txn-fk",
				NOW,
			);

			await expect(deleteSourceRow(database, source.id)).rejects.toThrow(
				/FOREIGN KEY/,
			);
		});

		it("rejects creating two sources with the same currency-code casing", async () => {
			await createSourceRow(database, {
				id: "s1",
				name: "Dup",
				currencyCode: "inr",
				validatedAt: null,
				createdAt: NOW,
				updatedAt: NOW,
				latestTransactionCreatedAt: null,
				balance: "0",
				archived: false,
			});

			const row = await getSourceRow(database, "s1");
			// currency code is stored as provided by the caller (service normalizes it)
			expect(row?.currencyCode).toBe("inr");
		});
	});

	describe("categories", () => {
		it("creates, lists and fetches a category", async () => {
			const category = await insertCategory(database, {
				name: "Groceries",
				isIncome: false,
			});

			const rows = await getCategoryRows(database);
			const row = await getCategoryRow(database, category.id);

			expect(rows.map((item) => item.id)).toContain(category.id);
			expect(row?.name).toBe("Groceries");
			expect(row?.isIncome).toBe(0);
		});

		it("upserts (updates) an existing category by id", async () => {
			const category = await insertCategory(database, { name: "Old" });

			await upsertCategoryRow(database, {
				...category,
				name: "New",
				isIncome: true,
				updatedAt: NOW,
			});

			const row = await getCategoryRow(database, category.id);
			expect(row?.name).toBe("New");
			expect(row?.isIncome).toBe(1);
		});

		it("separates archived from active categories", async () => {
			const active = await insertCategory(database, { name: "Active" });
			const archived = await insertCategory(database, {
				name: "Archived",
			});
			await setCategoryArchivedRow(database, archived.id, true, NOW);

			expect(
				(await getCategoryRows(database)).map((row) => row.id),
			).toEqual([active.id]);
			expect(
				(await getArchivedCategoryRows(database)).map((row) => row.id),
			).toEqual([archived.id]);
		});

		it("detects duplicate category names case-insensitively", async () => {
			const category = await insertCategory(database, { name: "Rent" });

			expect(await categoryNameExistsRow(database, "RENT")).toBe(true);
			expect(
				await categoryNameExistsRow(database, "rent", category.id),
			).toBe(false);
		});

		it("deletes an unused category", async () => {
			const category = await insertCategory(database);

			await deleteCategoryRow(database, category.id);

			expect(await getCategoryRow(database, category.id)).toBeNull();
		});

		it("throws a foreign-key error deleting a category used by a transaction", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
				}),
				"txn-fk-category",
				NOW,
			);

			await expect(
				deleteCategoryRow(database, category.id),
			).rejects.toThrow(/FOREIGN KEY/);
		});

		it("throws a foreign-key error deleting a category used by a budget", async () => {
			const category = await insertCategory(database);
			await upsertBudgetRow(database, {
				id: "budget-fk",
				categoryId: category.id,
				categoryName: category.name,
				amount: "100",
				period: "MONTHLY",
				createdAt: NOW,
				updatedAt: NOW,
			});

			await expect(
				deleteCategoryRow(database, category.id),
			).rejects.toThrow(/FOREIGN KEY/);
		});
	});

	describe("trips and investments (shared simple-entity helpers)", () => {
		it("creates, lists, archives and deletes trips", async () => {
			const trip = await insertTrip(database, { name: "Goa" });

			expect((await getTripRows(database)).map((row) => row.id)).toEqual([
				trip.id,
			]);
			expect(await getTripRow(database, trip.id)).not.toBeNull();

			await setSimpleEntityArchivedRow(
				database,
				"trips",
				trip.id,
				true,
				NOW,
			);
			expect((await getTripRows(database)).length).toBe(0);
			expect(
				(await getArchivedTripRows(database)).map((row) => row.id),
			).toEqual([trip.id]);

			await setSimpleEntityArchivedRow(
				database,
				"trips",
				trip.id,
				false,
				NOW,
			);
			await deleteSimpleEntityRow(database, "trips", trip.id);
			expect(await getTripRow(database, trip.id)).toBeNull();
		});

		it("creates, lists, archives and deletes investments", async () => {
			const investment = await insertInvestment(database, {
				name: "Mutual Fund",
			});

			expect(
				(await getInvestmentRows(database)).map((row) => row.id),
			).toEqual([investment.id]);
			expect(
				await getInvestmentRow(database, investment.id),
			).not.toBeNull();

			await setSimpleEntityArchivedRow(
				database,
				"investments",
				investment.id,
				true,
				NOW,
			);
			expect((await getInvestmentRows(database)).length).toBe(0);
			expect(
				(await getArchivedInvestmentRows(database)).map(
					(row) => row.id,
				),
			).toEqual([investment.id]);
		});

		it("detects duplicate names per table, excluding archived and the given id", async () => {
			const trip = await insertTrip(database, { name: "Goa" });

			expect(
				await simpleEntityNameExistsRow(database, "trips", "GOA"),
			).toBe(true);
			expect(
				await simpleEntityNameExistsRow(
					database,
					"trips",
					"goa",
					trip.id,
				),
			).toBe(false);
			expect(
				await simpleEntityNameExistsRow(database, "investments", "Goa"),
			).toBe(false);
		});

		it("updates name via upsert when called again with the same id", async () => {
			const trip = await insertTrip(database, { name: "Goa" });

			await upsertSimpleEntityRow(database, "trips", {
				...trip,
				name: "Goa Trip 2024",
				updatedAt: NOW,
			});

			const row = await getTripRow(database, trip.id);
			expect(row?.name).toBe("Goa Trip 2024");
		});

		it("throws a foreign-key error deleting a trip used by a transaction", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			const trip = await insertTrip(database);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
					tripId: trip.id,
				}),
				"txn-fk-trip",
				NOW,
			);

			await expect(
				deleteSimpleEntityRow(database, "trips", trip.id),
			).rejects.toThrow(/FOREIGN KEY/);
		});

		it("throws a foreign-key error deleting an investment used by a transaction", async () => {
			const source = await insertSource(database);
			const investment = await insertInvestment(database);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					classification: "INVESTMENT",
					investmentId: investment.id,
					categoryId: undefined,
				}),
				"txn-fk-investment",
				NOW,
			);

			await expect(
				deleteSimpleEntityRow(database, "investments", investment.id),
			).rejects.toThrow(/FOREIGN KEY/);
		});
	});

	describe("transactions", () => {
		it("creates a GENERAL/DEBIT transaction and joins related names", async () => {
			const source = await insertSource(database, { name: "Bank" });
			const category = await insertCategory(database, { name: "Food" });

			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
					amount: "250",
					reason: "Lunch",
				}),
				"txn-1",
				NOW,
			);

			const row = await getTransactionRow(database, "txn-1");
			expect(row?.sourceName).toBe("Bank");
			expect(row?.categoryName).toBe("Food");
			expect(row?.amount).toBe("250");
			expect(row?.hasAttachment).toBe(0);
		});

		it("creates a TRANSFER transaction with destination fields populated", async () => {
			const sourceA = await insertSource(database, { name: "Bank A" });
			const sourceB = await insertSource(database, { name: "Bank B" });

			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: sourceA.id,
					type: "TRANSFER",
					destinationSourceId: sourceB.id,
					toAmount: "100",
					amount: "100",
					categoryId: undefined,
					reason: "",
				}),
				"txn-transfer",
				NOW,
			);

			const row = await getTransactionRow(database, "txn-transfer");
			expect(row?.destinationSourceName).toBe("Bank B");
			expect(row?.toAmount).toBe("100");
		});

		it("creates an INVESTMENT transaction", async () => {
			const source = await insertSource(database);
			const investment = await insertInvestment(database, {
				name: "Index Fund",
			});

			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					classification: "INVESTMENT",
					investmentId: investment.id,
					categoryId: undefined,
					reason: "SIP",
				}),
				"txn-investment",
				NOW,
			);

			const row = await getTransactionRow(database, "txn-investment");
			expect(row?.investmentName).toBe("Index Fund");
			expect(row?.classification).toBe("INVESTMENT");
		});

		it("rejects a GENERAL/DEBIT transaction without a category (schema check)", async () => {
			const source = await insertSource(database);

			await expect(
				createTransactionRow(
					database,
					buildTransactionInput({
						sourceId: source.id,
						categoryId: undefined,
					}),
					"txn-invalid",
					NOW,
				),
			).rejects.toThrow(/CHECK constraint failed/);
		});

		it("rejects a non-positive amount (schema check)", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);

			await expect(
				createTransactionRow(
					database,
					buildTransactionInput({
						sourceId: source.id,
						categoryId: category.id,
						amount: "0",
					}),
					"txn-zero",
					NOW,
				),
			).rejects.toThrow(/CHECK constraint failed/);
		});

		it("updates an existing transaction in place", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
					amount: "100",
				}),
				"txn-update",
				NOW,
			);

			await updateTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
					amount: "500",
					reason: "Updated",
				}),
				"txn-update",
				NOW + 1,
			);

			const row = await getTransactionRow(database, "txn-update");
			expect(row?.amount).toBe("500");
			expect(row?.reason).toBe("Updated");
			expect(row?.updatedAt).toBe(NOW + 1);
		});

		it("filters transactions within a date range (inclusive)", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
					transactionAt: 1000,
				}),
				"txn-in-range",
				NOW,
			);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
					transactionAt: 5000,
				}),
				"txn-out-of-range",
				NOW,
			);

			const rows = await getTransactionRowsInRange(database, 0, 2000);

			expect(rows.map((row) => row.id)).toEqual(["txn-in-range"]);
		});

		it("reports the min/max transaction date across all transactions", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
					transactionAt: 1000,
				}),
				"txn-min",
				NOW,
			);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
					transactionAt: 9000,
				}),
				"txn-max",
				NOW,
			);

			const result = await getTransactionMinMaxDate(database);

			expect(result).toEqual({ minDate: 1000, maxDate: 9000 });
		});

		it("returns hasAttachment = 1 once an attachment is linked", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
				}),
				"txn-attachment",
				NOW,
			);
			await attachmentRepository.upsertAttachmentRow(
				database,
				"attachment-1",
				"TRANSACTION",
				"txn-attachment",
				{
					fileName: "receipt.png",
					mimeType: "image/png",
					sizeBytes: 3,
					content: new Uint8Array([1, 2, 3]),
				},
				NOW,
			);

			const row = await getTransactionRow(database, "txn-attachment");
			expect(row?.hasAttachment).toBe(1);
		});

		it("deletes a transaction and its attachment together", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
				}),
				"txn-delete",
				NOW,
			);
			await attachmentRepository.upsertAttachmentRow(
				database,
				"attachment-delete",
				"TRANSACTION",
				"txn-delete",
				{
					fileName: "a.png",
					mimeType: "image/png",
					sizeBytes: 1,
					content: new Uint8Array([9]),
				},
				NOW,
			);

			await deleteTransactionRow(database, "txn-delete");

			expect(await getTransactionRow(database, "txn-delete")).toBeNull();
			expect(
				await attachmentRepository.getAttachmentMetadataRow(
					database,
					"TRANSACTION",
					"txn-delete",
				),
			).toBeNull();
		});

		it("orders transactions by date descending", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
					transactionAt: 1000,
				}),
				"txn-old",
				NOW,
			);
			await createTransactionRow(
				database,
				buildTransactionInput({
					sourceId: source.id,
					categoryId: category.id,
					transactionAt: 2000,
				}),
				"txn-new",
				NOW,
			);

			const rows = await getTransactionRows(database);

			expect(rows.map((row) => row.id)).toEqual(["txn-new", "txn-old"]);
		});
	});

	describe("budgets", () => {
		it("creates and retrieves a budget joined with its category name", async () => {
			const category = await insertCategory(database, { name: "Rent" });

			await upsertBudgetRow(database, {
				id: "budget-1",
				categoryId: category.id,
				categoryName: category.name,
				amount: "20000",
				period: "MONTHLY",
				createdAt: NOW,
				updatedAt: NOW,
			});

			const row = await getBudgetRow(database, "budget-1");
			const rows = await getBudgetRows(database);
			expect(row?.categoryName).toBe("Rent");
			expect(rows).toHaveLength(1);
		});

		it("enforces one budget per category/period pair", async () => {
			const category = await insertCategory(database);
			await upsertBudgetRow(database, {
				id: "budget-a",
				categoryId: category.id,
				categoryName: category.name,
				amount: "100",
				period: "MONTHLY",
				createdAt: NOW,
				updatedAt: NOW,
			});

			await expect(
				upsertBudgetRow(database, {
					id: "budget-b",
					categoryId: category.id,
					categoryName: category.name,
					amount: "200",
					period: "MONTHLY",
					createdAt: NOW,
					updatedAt: NOW,
				}),
			).rejects.toThrow(/UNIQUE constraint failed/);
		});

		it("allows the same category with a different period", async () => {
			const category = await insertCategory(database);
			await upsertBudgetRow(database, {
				id: "budget-monthly",
				categoryId: category.id,
				categoryName: category.name,
				amount: "100",
				period: "MONTHLY",
				createdAt: NOW,
				updatedAt: NOW,
			});

			await upsertBudgetRow(database, {
				id: "budget-yearly",
				categoryId: category.id,
				categoryName: category.name,
				amount: "1200",
				period: "YEARLY",
				createdAt: NOW,
				updatedAt: NOW,
			});

			expect(await getBudgetRows(database)).toHaveLength(2);
		});

		it("deletes a budget", async () => {
			const category = await insertCategory(database);
			await upsertBudgetRow(database, {
				id: "budget-delete",
				categoryId: category.id,
				categoryName: category.name,
				amount: "100",
				period: "MONTHLY",
				createdAt: NOW,
				updatedAt: NOW,
			});

			await deleteBudgetRow(database, "budget-delete");

			expect(await getBudgetRow(database, "budget-delete")).toBeNull();
		});
	});

	describe("exchange rates", () => {
		it("upserts and lists exchange rates ordered by currency code", async () => {
			await upsertExchangeRateRow(database, {
				currencyCode: "USD",
				rateToInr: "83.5",
				source: "MANUAL",
				fetchedAt: null,
				updatedAt: NOW,
			});
			await upsertExchangeRateRow(database, {
				currencyCode: "AED",
				rateToInr: "22.7",
				source: "API",
				fetchedAt: NOW,
				updatedAt: NOW,
			});

			const rows = await getExchangeRateRows(database);

			expect(rows.map((row) => row.currencyCode)).toEqual(["AED", "USD"]);
		});

		it("updates an existing rate in place (conflict upsert)", async () => {
			await upsertExchangeRateRow(database, {
				currencyCode: "USD",
				rateToInr: "83.5",
				source: "MANUAL",
				fetchedAt: null,
				updatedAt: NOW,
			});

			await upsertExchangeRateRow(database, {
				currencyCode: "USD",
				rateToInr: "84.1",
				source: "API",
				fetchedAt: NOW + 1,
				updatedAt: NOW + 1,
			});

			const rows = await getExchangeRateRows(database);
			expect(rows).toHaveLength(1);
			expect(rows[0]?.rateToInr).toBe("84.1");
			expect(rows[0]?.source).toBe("API");
		});
	});
});
