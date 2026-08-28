import { describe, expect, it, vi } from "vitest";

describe("tripTotalService defensive guard", () => {
	it("skips malformed filtered records with empty tripId inside reducer loop", async () => {
		vi.resetModules();

		const getTransactionRows = vi.fn(async () => [
			{
				classification: "GENERAL",
				type: "DEBIT",
				tripId: "trip-a",
				sourceCurrencyCode: "INR",
				amount: "100",
			},
			{
				classification: "GENERAL",
				type: "DEBIT",
				tripId: "trip-b",
				sourceCurrencyCode: "USD",
				amount: "50",
			},
		]);

		vi.doMock("@/repositories/financeRepository", () => ({
			default: {
				getTransactionRows,
			},
		}));

		vi.doMock("@/utils/money", () => ({
			default: {
				ZERO_AMOUNT: "0",
				addMoney: vi.fn((left: string, right: string) =>
					left === "0" ? right : `${left}+${right}`,
				),
				subtractMoney: vi.fn((left: string, right: string) =>
					`${left}-${right}`,
				),
			},
		}));

		const module = await import("@/services/tripTotalService");
		const service = module.default;

		let tripReads = 0;
		const flakyTripTransaction = {
			classification: "GENERAL",
			type: "DEBIT",
			sourceCurrencyCode: "EUR",
			amount: "77",
			get tripId() {
				tripReads += 1;
				return tripReads === 1 ? "temp-trip" : "";
			},
		};

		const totals = service.buildTripTotals([
			flakyTripTransaction,
			{
				classification: "GENERAL",
				type: "DEBIT",
				tripId: "trip-a",
				sourceCurrencyCode: "INR",
				amount: "100",
			},
		] as any);

		expect(totals).toEqual([
			{
				tripId: "trip-a",
				currencyCode: "INR",
				credits: "0",
				debits: "100",
				total: "100-0",
			},
		]);

		const loaded = await service.getTripTotals({} as any);
		expect(getTransactionRows).toHaveBeenCalledTimes(1);
		expect(loaded).toHaveLength(2);
	});
});
