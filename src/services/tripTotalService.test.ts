import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getTransactionRows: vi.fn(async () => []),
}));

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		getTransactionRows: mocks.getTransactionRows,
	},
}));

import tripTotalService from "@/services/tripTotalService";

const database = {} as any;

describe("tripTotalService", () => {
	beforeEach(() => {
		mocks.getTransactionRows.mockClear();
	});

	it("builds totals only for general non-transfer transactions with trip", () => {
		const totals = tripTotalService.buildTripTotals([
			{
				classification: "GENERAL",
				type: "DEBIT",
				tripId: "trip1",
				sourceCurrencyCode: "INR",
				amount: "100",
			},
			{
				classification: "GENERAL",
				type: "CREDIT",
				tripId: "trip1",
				sourceCurrencyCode: "INR",
				amount: "40",
			},
			{
				classification: "GENERAL",
				type: "TRANSFER",
				tripId: "trip1",
				sourceCurrencyCode: "INR",
				amount: "999",
			},
			{
				classification: "INVESTMENT",
				type: "DEBIT",
				tripId: "trip1",
				sourceCurrencyCode: "INR",
				amount: "999",
			},
			{
				classification: "GENERAL",
				type: "DEBIT",
				tripId: null,
				sourceCurrencyCode: "USD",
				amount: "10",
			},
			{
				classification: "GENERAL",
				type: "DEBIT",
				tripId: "trip1",
				sourceCurrencyCode: "USD",
				amount: "10",
			},
		] as any);

		expect(totals).toEqual([
			{
				tripId: "trip1",
				currencyCode: "INR",
				credits: "40",
				debits: "100",
				total: "60",
			},
			{
				tripId: "trip1",
				currencyCode: "USD",
				credits: "0",
				debits: "10",
				total: "10",
			},
		]);
	});

	it("loads transactions from repository in getTripTotals", async () => {
		mocks.getTransactionRows.mockResolvedValueOnce([
			{
				classification: "GENERAL",
				type: "DEBIT",
				tripId: "trip2",
				sourceCurrencyCode: "EUR",
				amount: "5",
			},
		]);

		const totals = await tripTotalService.getTripTotals(database);
		expect(mocks.getTransactionRows).toHaveBeenCalledWith(database);
		expect(totals).toEqual([
			{
				tripId: "trip2",
				currencyCode: "EUR",
				credits: "0",
				debits: "5",
				total: "5",
			},
		]);
	});

	it("handles credit-only totals and sorts currencies alphabetically", () => {
		const totals = tripTotalService.buildTripTotals([
			{
				classification: "GENERAL",
				type: "CREDIT",
				tripId: "tripA",
				sourceCurrencyCode: "USD",
				amount: "50",
			},
			{
				classification: "GENERAL",
				type: "CREDIT",
				tripId: "tripA",
				sourceCurrencyCode: "EUR",
				amount: "20",
			},
			{
				classification: "GENERAL",
				type: "CREDIT",
				tripId: "tripA",
				sourceCurrencyCode: "USD",
				amount: "10",
			},
		] as any);

		expect(totals).toEqual([
			{
				tripId: "tripA",
				currencyCode: "EUR",
				credits: "20",
				debits: "0",
				total: "-20",
			},
			{
				tripId: "tripA",
				currencyCode: "USD",
				credits: "60",
				debits: "0",
				total: "-60",
			},
		]);
	});
});
