import Decimal from "decimal.js";

import appConstants from "@/constants/appConstants";
import AppError from "@/errors/AppError";
import financeRepository from "@/repositories/financeRepository";
import type ExchangeRate from "@/types/ExchangeRate";
import moneyUtils from "@/utils/money";
import type { SQLiteDatabase } from "expo-sqlite";
import { z } from "zod";

const { DEFAULT_CURRENCY_CODE, EXCHANGE_RATE_API_URL } = appConstants;
const { getExchangeRateRows, getSourceRows, upsertExchangeRateRow } =
	financeRepository;
const { normalizeMoney } = moneyUtils;

const exchangeRateResponseSchema = z.array(
	z.object({
		base: z.string(),
		date: z.string(),
		quote: z.string(),
		rate: z.number().positive(),
	}),
);

const getExchangeRates = async (
	database: SQLiteDatabase,
): Promise<readonly ExchangeRate[]> => getExchangeRateRows(database);

const saveManualExchangeRate = async (
	database: SQLiteDatabase,
	currencyCode: string,
	rateToInr: string,
): Promise<void> => {
	const normalizedCurrency = currencyCode.trim().toUpperCase();
	if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
		throw new AppError("INVALID_CURRENCY", "Invalid currency code.");
	}
	const now = Date.now();
	await upsertExchangeRateRow(database, {
		currencyCode: normalizedCurrency,
		rateToInr: normalizeMoney(rateToInr),
		source: "MANUAL",
		fetchedAt: null,
		updatedAt: now,
	});
};

const fetchExchangeRates = async (
	database: SQLiteDatabase,
): Promise<number> => {
	const sources = await getSourceRows(database);
	const currencies = [
		...new Set(
			sources
				.map((source) => source.currencyCode)
				.filter((currency) => currency !== DEFAULT_CURRENCY_CODE),
		),
	];
	if (currencies.length === 0) {
		return 0;
	}
	const query = new URLSearchParams({
		base: DEFAULT_CURRENCY_CODE,
		quotes: currencies.join(","),
	});
	const response = await fetch(
		`${EXCHANGE_RATE_API_URL}?${query.toString()}`,
	);
	if (!response.ok) {
		throw new AppError(
			"RATE_FETCH_FAILED",
			`Exchange-rate request failed with status ${response.status}.`,
		);
	}
	const payload: unknown = await response.json();
	const parsedResponse = exchangeRateResponseSchema.safeParse(payload);
	if (!parsedResponse.success) {
		throw new AppError(
			"INVALID_RATE_RESPONSE",
			"The exchange-rate service returned invalid data.",
		);
	}
	const now = Date.now();
	await database.withTransactionAsync(async (): Promise<void> => {
		for (const rate of parsedResponse.data) {
			const rateToInr = new Decimal(1).dividedBy(rate.rate).toFixed();
			await upsertExchangeRateRow(database, {
				currencyCode: rate.quote.toUpperCase(),
				rateToInr,
				source: "API",
				fetchedAt: now,
				updatedAt: now,
			});
		}
	});
	return parsedResponse.data.length;
};

const exchangeRateService = {
	fetchExchangeRates,
	getExchangeRates,
	saveManualExchangeRate,
};

export default exchangeRateService;
