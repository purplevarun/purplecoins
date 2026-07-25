import transactionService from "@/services/transactionService";

import { beforeEach, describe, expect, it } from "vitest";

import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type Transaction from "@/types/Transaction";
import type TransactionInput from "@/types/TransactionInput";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	deleteTransaction,
	getLinkedTransactions,
	getTransaction,
	getTransactionDisplayReason,
	getTransactions,
	saveTransaction,
} = transactionService;
const { insertCategory, insertInvestment, insertSource, insertTrip } =
	dbFixtures;

const NOW = 1_780_000_000_000;

const createTransactionRecord = (
	overrides: Partial<Transaction> = {},
): Transaction => ({
	id: "txn",
	classification: "GENERAL",
	type: "DEBIT",
	sourceId: "source",
	destinationSourceId: null,
	amount: "0",
	toAmount: null,
	categoryId: null,
	tripId: null,
	investmentId: null,
	reason: "",
	transactionAt: NOW,
	createdAt: NOW,
	updatedAt: NOW,
	sourceName: "Bank",
	sourceCurrencyCode: "INR",
	destinationSourceName: null,
	destinationCurrencyCode: null,
	categoryName: null,
	tripName: null,
	investmentName: null,
	hasAttachment: false,
	...overrides,
});

describe("transactionService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("saveTransaction — GENERAL (DEBIT/CREDIT)", () => {
		it("creates a debit transaction against a category", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);

			const id = await saveTransaction(database, {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				amount: "250.5",
				reason: "Lunch",
				transactionAt: NOW,
			});

			const transaction = await getTransaction(database, id);
			expect(transaction?.amount).toBe("250.5");
			expect(transaction?.categoryId).toBe(category.id);
			expect(transaction?.reason).toBe("Lunch");
		});

		it("throws SOURCE_REQUIRED when sourceId is empty", async () => {
			await expect(
				saveTransaction(database, {
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: "",
					categoryId: "whatever",
					amount: "10",
					reason: "x",
					transactionAt: NOW,
				}),
			).rejects.toMatchObject({ code: "SOURCE_REQUIRED" });
		});

		it("throws CATEGORY_REQUIRED when no category is selected", async () => {
			const source = await insertSource(database);
			await expect(
				saveTransaction(database, {
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: source.id,
					amount: "10",
					reason: "x",
					transactionAt: NOW,
				}),
			).rejects.toMatchObject({ code: "CATEGORY_REQUIRED" });
		});

		it("throws TRANSACTION_REASON_REQUIRED when the reason is blank", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await expect(
				saveTransaction(database, {
					classification: "GENERAL",
					type: "CREDIT",
					sourceId: source.id,
					categoryId: category.id,
					amount: "10",
					reason: "   ",
					transactionAt: NOW,
				}),
			).rejects.toMatchObject({ code: "TRANSACTION_REASON_REQUIRED" });
		});

		it("throws INVALID_AMOUNT for a non-numeric amount", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await expect(
				saveTransaction(database, {
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: source.id,
					categoryId: category.id,
					amount: "not-a-number",
					reason: "x",
					transactionAt: NOW,
				}),
			).rejects.toMatchObject({ code: "INVALID_AMOUNT" });
		});

		it("strips investment/destination/toAmount fields for a category transaction", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			const trip = await insertTrip(database);

			const id = await saveTransaction(database, {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				tripId: trip.id,
				investmentId: "should-be-stripped",
				destinationSourceId: "should-be-stripped",
				toAmount: "999",
				amount: "10",
				reason: "Trip expense",
				transactionAt: NOW,
			});

			const transaction = await getTransaction(database, id);
			expect(transaction?.tripId).toBe(trip.id);
			expect(transaction?.investmentId).toBeNull();
			expect(transaction?.destinationSourceId).toBeNull();
			expect(transaction?.toAmount).toBeNull();
		});
	});

	describe("saveTransaction — INVESTMENT", () => {
		it("creates an investment transaction, forcing TRANSFER down to DEBIT", async () => {
			const source = await insertSource(database);
			const investment = await insertInvestment(database);

			const id = await saveTransaction(database, {
				classification: "INVESTMENT",
				type: "TRANSFER",
				sourceId: source.id,
				investmentId: investment.id,
				amount: "5000",
				reason: "SIP",
				transactionAt: NOW,
			});

			const transaction = await getTransaction(database, id);
			expect(transaction?.type).toBe("DEBIT");
			expect(transaction?.investmentId).toBe(investment.id);
			expect(transaction?.categoryId).toBeNull();
		});

		it("throws INVESTMENT_REQUIRED without an investmentId", async () => {
			const source = await insertSource(database);
			await expect(
				saveTransaction(database, {
					classification: "INVESTMENT",
					type: "DEBIT",
					sourceId: source.id,
					amount: "10",
					reason: "x",
					transactionAt: NOW,
				}),
			).rejects.toMatchObject({ code: "INVESTMENT_REQUIRED" });
		});

		it("throws TRANSACTION_REASON_REQUIRED for a blank reason", async () => {
			const source = await insertSource(database);
			const investment = await insertInvestment(database);
			await expect(
				saveTransaction(database, {
					classification: "INVESTMENT",
					type: "CREDIT",
					sourceId: source.id,
					investmentId: investment.id,
					amount: "10",
					reason: "",
					transactionAt: NOW,
				}),
			).rejects.toMatchObject({ code: "TRANSACTION_REASON_REQUIRED" });
		});
	});

	describe("saveTransaction — TRANSFER", () => {
		it("creates a same-currency transfer, defaulting toAmount to amount", async () => {
			const sourceA = await insertSource(database, {
				currencyCode: "INR",
			});
			const sourceB = await insertSource(database, {
				currencyCode: "INR",
			});

			const id = await saveTransaction(database, {
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: sourceA.id,
				destinationSourceId: sourceB.id,
				amount: "500",
				reason: "",
				transactionAt: NOW,
			});

			const transaction = await getTransaction(database, id);
			expect(transaction?.toAmount).toBe("500");
		});

		it("ignores a provided toAmount for a same-currency transfer, forcing it to equal amount", async () => {
			// prepareTransactionInput sets `toAmount = amount` whenever the
			// source/destination currencies match, *before* comparing them
			// for a mismatch — so the comparison always sees equal values
			// and any caller-supplied toAmount for a same-currency transfer
			// is silently overwritten rather than validated.
			const sourceA = await insertSource(database, {
				currencyCode: "INR",
			});
			const sourceB = await insertSource(database, {
				currencyCode: "INR",
			});

			const id = await saveTransaction(database, {
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: sourceA.id,
				destinationSourceId: sourceB.id,
				amount: "500",
				toAmount: "400",
				reason: "",
				transactionAt: NOW,
			});

			const transaction = await getTransaction(database, id);
			expect(transaction?.toAmount).toBe("500");
		});

		it("normalizes a provided toAmount for a cross-currency transfer", async () => {
			const sourceA = await insertSource(database, {
				currencyCode: "INR",
			});
			const sourceB = await insertSource(database, {
				currencyCode: "USD",
			});

			const id = await saveTransaction(database, {
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: sourceA.id,
				destinationSourceId: sourceB.id,
				amount: "1000",
				toAmount: "12.00",
				reason: "",
				transactionAt: NOW,
			});

			const transaction = await getTransaction(database, id);
			expect(transaction?.toAmount).toBe("12");
		});

		it("throws INVALID_AMOUNT when a cross-currency transfer has no toAmount", async () => {
			const sourceA = await insertSource(database, {
				currencyCode: "INR",
			});
			const sourceB = await insertSource(database, {
				currencyCode: "USD",
			});

			await expect(
				saveTransaction(database, {
					classification: "GENERAL",
					type: "TRANSFER",
					sourceId: sourceA.id,
					destinationSourceId: sourceB.id,
					amount: "1000",
					reason: "",
					transactionAt: NOW,
				}),
			).rejects.toMatchObject({ code: "INVALID_AMOUNT" });
		});

		it("throws DESTINATION_REQUIRED without a destinationSourceId", async () => {
			const source = await insertSource(database);
			await expect(
				saveTransaction(database, {
					classification: "GENERAL",
					type: "TRANSFER",
					sourceId: source.id,
					amount: "10",
					reason: "",
					transactionAt: NOW,
				}),
			).rejects.toMatchObject({ code: "DESTINATION_REQUIRED" });
		});

		it("throws SAME_TRANSFER_SOURCE when source equals destination", async () => {
			const source = await insertSource(database);
			await expect(
				saveTransaction(database, {
					classification: "GENERAL",
					type: "TRANSFER",
					sourceId: source.id,
					destinationSourceId: source.id,
					amount: "10",
					reason: "",
					transactionAt: NOW,
				}),
			).rejects.toMatchObject({ code: "SAME_TRANSFER_SOURCE" });
		});

		it("throws SOURCE_NOT_FOUND when the destination source does not exist", async () => {
			const source = await insertSource(database);
			await expect(
				saveTransaction(database, {
					classification: "GENERAL",
					type: "TRANSFER",
					sourceId: source.id,
					destinationSourceId: "nonexistent",
					amount: "10",
					reason: "",
					transactionAt: NOW,
				}),
			).rejects.toMatchObject({ code: "SOURCE_NOT_FOUND" });
		});
	});

	describe("saveTransaction (update path)", () => {
		it("updates an existing transaction using the provided id", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			const input: TransactionInput = {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				amount: "100",
				reason: "Original",
				transactionAt: NOW,
			};
			const id = await saveTransaction(database, input);

			const updatedId = await saveTransaction(database, {
				...input,
				id,
				amount: "200",
				reason: "Updated",
			});

			expect(updatedId).toBe(id);
			const transaction = await getTransaction(database, id);
			expect(transaction?.amount).toBe("200");
			expect(transaction?.reason).toBe("Updated");
		});

		it("updates an existing INVESTMENT transaction (categoryId/tripId/destination stay null)", async () => {
			const source = await insertSource(database);
			const investment = await insertInvestment(database);
			const id = await saveTransaction(database, {
				classification: "INVESTMENT",
				type: "DEBIT",
				sourceId: source.id,
				investmentId: investment.id,
				amount: "1000",
				reason: "SIP",
				transactionAt: NOW,
			});

			await saveTransaction(database, {
				id,
				classification: "INVESTMENT",
				type: "CREDIT",
				sourceId: source.id,
				investmentId: investment.id,
				amount: "1500",
				reason: "Redeemed",
				transactionAt: NOW,
			});

			const transaction = await getTransaction(database, id);
			expect(transaction?.type).toBe("CREDIT");
			expect(transaction?.amount).toBe("1500");
			expect(transaction?.categoryId).toBeNull();
			expect(transaction?.tripId).toBeNull();
			expect(transaction?.destinationSourceId).toBeNull();
		});
	});

	describe("getTransactions / getTransaction / deleteTransaction", () => {
		it("lists and coerces hasAttachment to a boolean", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await saveTransaction(database, {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				amount: "10",
				reason: "x",
				transactionAt: NOW,
			});

			const transactions = await getTransactions(database);
			expect(transactions).toHaveLength(1);
			expect(transactions[0]?.hasAttachment).toBe(false);
		});

		it("returns null for a missing transaction", async () => {
			expect(await getTransaction(database, "missing")).toBeNull();
		});

		it("deletes a transaction", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			const id = await saveTransaction(database, {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				amount: "10",
				reason: "x",
				transactionAt: NOW,
			});

			await deleteTransaction(database, id);

			expect(await getTransaction(database, id)).toBeNull();
		});
	});

	describe("getLinkedTransactions", () => {
		it("matches SOURCE filters against either the source or destination", async () => {
			const sourceA = await insertSource(database);
			const sourceB = await insertSource(database);
			const category = await insertCategory(database);
			await saveTransaction(database, {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: sourceA.id,
				categoryId: category.id,
				amount: "10",
				reason: "from A",
				transactionAt: NOW,
			});
			await saveTransaction(database, {
				classification: "GENERAL",
				type: "TRANSFER",
				sourceId: sourceB.id,
				destinationSourceId: sourceA.id,
				amount: "10",
				reason: "",
				transactionAt: NOW,
			});
			await saveTransaction(database, {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: sourceB.id,
				categoryId: category.id,
				amount: "10",
				reason: "unrelated",
				transactionAt: NOW,
			});

			const linked = await getLinkedTransactions(database, {
				kind: "SOURCE",
				entityId: sourceA.id,
			});

			expect(linked).toHaveLength(2);
		});

		it("matches CATEGORY/TRIP/INVESTMENT filters against their respective id", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			const trip = await insertTrip(database);
			const investment = await insertInvestment(database);
			await saveTransaction(database, {
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				tripId: trip.id,
				amount: "10",
				reason: "trip expense",
				transactionAt: NOW,
			});
			await saveTransaction(database, {
				classification: "INVESTMENT",
				type: "DEBIT",
				sourceId: source.id,
				investmentId: investment.id,
				amount: "10",
				reason: "SIP",
				transactionAt: NOW,
			});

			expect(
				await getLinkedTransactions(database, {
					kind: "CATEGORY",
					entityId: category.id,
				}),
			).toHaveLength(1);
			expect(
				await getLinkedTransactions(database, {
					kind: "TRIP",
					entityId: trip.id,
				}),
			).toHaveLength(1);
			expect(
				await getLinkedTransactions(database, {
					kind: "INVESTMENT",
					entityId: investment.id,
				}),
			).toHaveLength(1);
		});
	});

	describe("getTransactionDisplayReason", () => {
		it("returns the reason when present", () => {
			expect(
				getTransactionDisplayReason(
					createTransactionRecord({ reason: "Lunch" }),
				),
			).toBe("Lunch");
		});

		it("falls back to 'source to destination' for a reasonless transfer", () => {
			expect(
				getTransactionDisplayReason(
					createTransactionRecord({
						reason: "",
						type: "TRANSFER",
						sourceName: "Bank",
						destinationSourceName: "Cash",
					}),
				),
			).toBe("Bank to Cash");
		});

		it("falls back to the generic label otherwise", () => {
			expect(
				getTransactionDisplayReason(
					createTransactionRecord({
						reason: "",
						type: "DEBIT",
					}),
				),
			).toBe("Transaction");
		});
	});
});
