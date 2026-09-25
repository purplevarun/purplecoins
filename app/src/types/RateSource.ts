import type financeConstants from "@/constants/financeConstants";

type RateSource = (typeof financeConstants.RATE_SOURCES)[number];

export type { RateSource as default };
