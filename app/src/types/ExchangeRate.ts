import type RateSource from "@/types/RateSource";

type ExchangeRate = Readonly<{
	currencyCode: string;
	rateToInr: string;
	source: RateSource;
	fetchedAt: number | null;
	updatedAt: number;
}>;

export type { ExchangeRate as default };
