import exchangeRateService from "@/services/exchangeRateService";

import Decimal from "decimal.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const { fetchExchangeRates, getExchangeRates, saveManualExchangeRate } =
	exchangeRateService;
const { insertSource } = dbFixtures;

const jsonResponse = (
	body: unknown,
	init: Readonly<{ ok?: boolean; status?: number }> = {},
): Response =>
	({
		ok: init.ok ?? true,
		status: init.status ?? 200,
		json: (): Promise<unknown> => Promise.resolve(body),
	}) as Response;

describe("exchangeRateService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("saveManualExchangeRate", () => {
		it("normalizes the currency code and rate", async () => {
			await saveManualExchangeRate(database, "usd", "83.5000");

			const [rate] = await getExchangeRates(database);
			expect(rate).toMatchObject({
				currencyCode: "USD",
				rateToInr: "83.5",
				source: "MANUAL",
				fetchedAt: null,
			});
		});

		it("trims surrounding whitespace from the currency code", async () => {
			await saveManualExchangeRate(database, "  usd  ", "80");
			expect((await getExchangeRates(database))[0]?.currencyCode).toBe(
				"USD",
			);
		});

		it("throws INVALID_CURRENCY for a malformed code", async () => {
			await expect(
				saveManualExchangeRate(database, "US", "80"),
			).rejects.toMatchObject({ code: "INVALID_CURRENCY" });
			await expect(
				saveManualExchangeRate(database, "1234", "80"),
			).rejects.toMatchObject({ code: "INVALID_CURRENCY" });
		});

		it("throws INVALID_AMOUNT for a non-numeric rate", async () => {
			await expect(
				saveManualExchangeRate(database, "USD", "abc"),
			).rejects.toMatchObject({ code: "INVALID_AMOUNT" });
		});

		it("updates an existing rate on conflict", async () => {
			await saveManualExchangeRate(database, "USD", "80");
			await saveManualExchangeRate(database, "USD", "85");

			const rates = await getExchangeRates(database);
			expect(rates).toHaveLength(1);
			expect(rates[0]?.rateToInr).toBe("85");
		});
	});

	describe("fetchExchangeRates", () => {
		it("returns 0 and does not call fetch when there are no sources", async () => {
			const fetchMock = vi.fn();
			vi.stubGlobal("fetch", fetchMock);

			const count = await fetchExchangeRates(database);

			expect(count).toBe(0);
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it("returns 0 when every source already uses the default currency (INR)", async () => {
			await insertSource(database, { currencyCode: "INR" });
			const fetchMock = vi.fn();
			vi.stubGlobal("fetch", fetchMock);

			const count = await fetchExchangeRates(database);

			expect(count).toBe(0);
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it("requests de-duplicated foreign currencies and stores inverted rates", async () => {
			await insertSource(database, { currencyCode: "USD" });
			await insertSource(database, { currencyCode: "USD" });
			await insertSource(database, { currencyCode: "EUR" });
			await insertSource(database, { currencyCode: "INR" });
			const fetchMock = vi.fn().mockResolvedValue(
				jsonResponse([
					{
						base: "INR",
						date: "2026-01-01",
						quote: "USD",
						rate: 0.012,
					},
					{
						base: "INR",
						date: "2026-01-01",
						quote: "EUR",
						rate: 0.011,
					},
				]),
			);
			vi.stubGlobal("fetch", fetchMock);

			const count = await fetchExchangeRates(database);

			expect(count).toBe(2);
			expect(fetchMock).toHaveBeenCalledTimes(1);
			const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
			expect(requestedUrl.searchParams.get("base")).toBe("INR");
			expect(
				requestedUrl.searchParams.get("quotes")?.split(",").sort(),
			).toEqual(["EUR", "USD"]);

			const rates = await getExchangeRates(database);
			const usdRate = rates.find((rate) => rate.currencyCode === "USD");
			expect(usdRate?.rateToInr).toBe(
				new Decimal(1).dividedBy(0.012).toFixed(),
			);
			expect(usdRate?.source).toBe("API");
			expect(usdRate?.fetchedAt).not.toBeNull();
		});

		it("throws RATE_FETCH_FAILED with the status code when the response is not ok", async () => {
			await insertSource(database, { currencyCode: "USD" });
			vi.stubGlobal(
				"fetch",
				vi
					.fn()
					.mockResolvedValue(
						jsonResponse([], { ok: false, status: 503 }),
					),
			);

			await expect(fetchExchangeRates(database)).rejects.toMatchObject({
				code: "RATE_FETCH_FAILED",
			});
			await expect(fetchExchangeRates(database)).rejects.toThrow(/503/);
		});

		it("throws INVALID_RATE_RESPONSE when the payload fails schema validation", async () => {
			await insertSource(database, { currencyCode: "USD" });
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue(
					jsonResponse([{ base: "INR", quote: "USD" }]), // missing rate/date
				),
			);

			await expect(fetchExchangeRates(database)).rejects.toMatchObject({
				code: "INVALID_RATE_RESPONSE",
			});
		});

		it("throws INVALID_RATE_RESPONSE when rate is not positive", async () => {
			await insertSource(database, { currencyCode: "USD" });
			vi.stubGlobal(
				"fetch",
				vi.fn().mockResolvedValue(
					jsonResponse([
						{
							base: "INR",
							date: "2026-01-01",
							quote: "USD",
							rate: -1,
						},
					]),
				),
			);

			await expect(fetchExchangeRates(database)).rejects.toMatchObject({
				code: "INVALID_RATE_RESPONSE",
			});
		});
	});
});
