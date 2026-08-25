import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getExchangeRateRows: vi.fn(async () => []),
	getSourceRows: vi.fn(async () => []),
	upsertExchangeRateRow: vi.fn(async () => {}),
}));

vi.mock("@/constants/appConstants", () => ({
	default: {
		DEFAULT_CURRENCY_CODE: "INR",
		EXCHANGE_RATE_API_URL: "https://rates.example.test",
	},
}));

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		getExchangeRateRows: mocks.getExchangeRateRows,
		getSourceRows: mocks.getSourceRows,
		upsertExchangeRateRow: mocks.upsertExchangeRateRow,
	},
}));

import exchangeRateService from "@/services/exchangeRateService";

const database = {
	withTransactionAsync: vi.fn(async (callback: () => Promise<void>) => {
		await callback();
	}),
} as any;

describe("exchangeRateService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		mocks.getExchangeRateRows.mockClear();
		mocks.getSourceRows.mockClear();
		mocks.upsertExchangeRateRow.mockClear();
		database.withTransactionAsync.mockClear();
		vi.unstubAllGlobals();
	});

	it("gets existing exchange rates", async () => {
		mocks.getExchangeRateRows.mockResolvedValueOnce([{ currencyCode: "USD" }]);
		expect(await exchangeRateService.getExchangeRates(database)).toEqual([{ currencyCode: "USD" }]);
	});

	it("validates manual currency code", async () => {
		await expect(
			exchangeRateService.saveManualExchangeRate(database, "x1", "10"),
		).rejects.toMatchObject<AppError>({ code: "INVALID_CURRENCY" });
	});

	it("saves manual exchange rate with normalization", async () => {
		await exchangeRateService.saveManualExchangeRate(database, " usd ", "00123.4500");
		expect(mocks.upsertExchangeRateRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				currencyCode: "USD",
				rateToInr: "123.45",
				source: "MANUAL",
				fetchedAt: null,
				updatedAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			}),
		);
	});

	it("returns 0 when there are no non-default currencies", async () => {
		mocks.getSourceRows.mockResolvedValueOnce([
			{ currencyCode: "INR" },
			{ currencyCode: "INR" },
		]);
		const count = await exchangeRateService.fetchExchangeRates(database);
		expect(count).toBe(0);
		expect(database.withTransactionAsync).not.toHaveBeenCalled();
	});

	it("throws on non-ok fetch response", async () => {
		mocks.getSourceRows.mockResolvedValueOnce([{ currencyCode: "USD" }]);
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({ ok: false, status: 503 })),
		);
		await expect(exchangeRateService.fetchExchangeRates(database)).rejects.toMatchObject<AppError>({
			code: "RATE_FETCH_FAILED",
		});
	});

	it("throws on invalid payload", async () => {
		mocks.getSourceRows.mockResolvedValueOnce([{ currencyCode: "USD" }]);
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: true,
				json: async () => ({ bad: true }),
			})),
		);
		await expect(exchangeRateService.fetchExchangeRates(database)).rejects.toMatchObject<AppError>({
			code: "INVALID_RATE_RESPONSE",
		});
	});

	it("fetches and stores reciprocal rates", async () => {
		mocks.getSourceRows.mockResolvedValueOnce([
			{ currencyCode: "USD" },
			{ currencyCode: "EUR" },
			{ currencyCode: "INR" },
			{ currencyCode: "USD" },
		]);
		vi.stubGlobal(
			"fetch",
			vi.fn(async (url: string) => {
				expect(url).toContain("base=INR");
				expect(url).toContain("quotes=USD%2CEUR");
				return {
					ok: true,
					json: async () => [
						{ base: "INR", date: "2026-08-25", quote: "usd", rate: 0.0125 },
						{ base: "INR", date: "2026-08-25", quote: "EUR", rate: 0.01 },
					],
				};
			}),
		);

		const count = await exchangeRateService.fetchExchangeRates(database);
		expect(count).toBe(2);
		expect(database.withTransactionAsync).toHaveBeenCalledTimes(1);
		expect(mocks.upsertExchangeRateRow).toHaveBeenNthCalledWith(
			1,
			database,
			expect.objectContaining({
				currencyCode: "USD",
				rateToInr: "80",
				source: "API",
				fetchedAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			}),
		);
		expect(mocks.upsertExchangeRateRow).toHaveBeenNthCalledWith(
			2,
			database,
			expect.objectContaining({
				currencyCode: "EUR",
				rateToInr: "100",
				source: "API",
			}),
		);
	});
});
