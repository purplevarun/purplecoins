import {
	DEFAULT_CURRENCY_CODE,
	EXCHANGE_RATE_API_URL,
} from "@/constants/appConstants";
import type { WebDatabase } from "@/db/database";
import {
	getExchangeRateRows,
	getSourceRows,
	upsertExchangeRateRow,
} from "@/repositories/financeRepository";
import type { ExchangeRate } from "@/types/ExchangeRate";
import { AppError } from "@/utils/AppError";
import { normalizeMoney } from "@/utils/money";
import Decimal from "decimal.js";

const getExchangeRates = async (
	database: WebDatabase,
): Promise<readonly ExchangeRate[]> => getExchangeRateRows(database);

const saveManualExchangeRate = async (
	database: WebDatabase,
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

const fetchExchangeRates = async (database: WebDatabase): Promise<number> => {
	const sources = await getSourceRows(database);
	const currencies = [
		...new Set(
			sources
				.map((s) => s.currencyCode)
				.filter((c) => c !== DEFAULT_CURRENCY_CODE),
		),
	];
	if (currencies.length === 0) return 0;
	const query = new URLSearchParams({
		base: DEFAULT_CURRENCY_CODE,
		quotes: currencies.join(","),
	});
	const response = await fetch(
		`${EXCHANGE_RATE_API_URL}?${query.toString()}`,
	);
	if (!response.ok)
		throw new AppError(
			"RATE_FETCH_FAILED",
			`Exchange-rate request failed: ${response.status}`,
		);
	const payload = (await response.json()) as unknown[];
	if (!Array.isArray(payload))
		throw new AppError("INVALID_RATE_RESPONSE", "Invalid rate data.");
	const now = Date.now();
	await database.withTransactionAsync(async () => {
		for (const rate of payload as {
			base: string;
			quote: string;
			rate: number;
		}[]) {
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
	return payload.length;
};

export { fetchExchangeRates, getExchangeRates, saveManualExchangeRate };
