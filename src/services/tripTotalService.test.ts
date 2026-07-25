import tripTotalService from "@/services/tripTotalService";

import { beforeEach, describe, expect, it } from "vitest";

import financeRepository from "@/repositories/financeRepository";
import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type Transaction from "@/types/Transaction";
import type { SQLiteDatabase } from "expo-sqlite";

const { buildTripTotals, getTripTotals } = tripTotalService;
const { insertCategory, insertSource, insertTrip } = dbFixtures;
const { createTransactionRow } = financeRepository;

const NOW = 1_780_000_000_000;

const createTransaction = (
	overrides: Partial<Transaction> = {},
): Transaction => ({
	id: "txn",
	classification: "GENERAL",
	type: "DEBIT",
	sourceId: "source",
	destinationSourceId: null,
	amount: "0",
	toAmount: null,
	categoryId: "category",
	tripId: "trip",
	investmentId: null,
	reason: "x",
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

describe("buildTripTotals (pure)", () => {
	it("nets debits against credits per trip and currency", () => {
		const totals = buildTripTotals([
			createTransaction({ id: "1", type: "DEBIT", amount: "1000" }),
			createTransaction({ id: "2", type: "CREDIT", amount: "300" }),
		]);

		expect(totals).toEqual([
			{
				tripId: "trip",
				currencyCode: "INR",
				credits: "300",
				debits: "1000",
				total: "700",
			},
		]);
	});

	it("excludes TRANSFER transactions even if they carry a tripId", () => {
		const totals = buildTripTotals([
			createTransaction({ type: "TRANSFER", amount: "500" }),
		]);
		expect(totals).toEqual([]);
	});

	it("excludes INVESTMENT-classified transactions", () => {
		const totals = buildTripTotals([
			createTransaction({ classification: "INVESTMENT", amount: "500" }),
		]);
		expect(totals).toEqual([]);
	});

	it("excludes transactions without a tripId", () => {
		const totals = buildTripTotals([
			createTransaction({ tripId: null, amount: "500" }),
		]);
		expect(totals).toEqual([]);
	});

	it("keeps different trips and different currencies as separate rows", () => {
		const totals = buildTripTotals([
			createTransaction({
				id: "1",
				tripId: "trip-a",
				sourceCurrencyCode: "INR",
				amount: "100",
			}),
			createTransaction({
				id: "2",
				tripId: "trip-a",
				sourceCurrencyCode: "USD",
				amount: "10",
			}),
			createTransaction({
				id: "3",
				tripId: "trip-b",
				sourceCurrencyCode: "INR",
				amount: "50",
			}),
		]);

		expect(totals).toHaveLength(3);
	});

	it("sorts results by currency code", () => {
		const totals = buildTripTotals([
			createTransaction({
				id: "1",
				tripId: "trip-a",
				sourceCurrencyCode: "USD",
				amount: "10",
			}),
			createTransaction({
				id: "2",
				tripId: "trip-a",
				sourceCurrencyCode: "AED",
				amount: "10",
			}),
		]);

		expect(totals.map((total) => total.currencyCode)).toEqual([
			"AED",
			"USD",
		]);
	});
});

describe("getTripTotals (integration)", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	it("aggregates real transaction rows for a trip", async () => {
		const source = await insertSource(database);
		const category = await insertCategory(database);
		const trip = await insertTrip(database);
		await createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				tripId: trip.id,
				amount: "2000",
				reason: "Hotel",
				transactionAt: NOW,
			},
			"txn-1",
			NOW,
		);

		const totals = await getTripTotals(database);

		expect(totals).toEqual([
			{
				tripId: trip.id,
				currencyCode: "INR",
				credits: "0",
				debits: "2000",
				total: "2000",
			},
		]);
	});
});
