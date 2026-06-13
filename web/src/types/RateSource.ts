import type { RATE_SOURCES } from "@/constants/financeConstants";

type RateSource = (typeof RATE_SOURCES)[number];

export type { RateSource };
