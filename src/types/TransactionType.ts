import type financeConstants from "@/constants/financeConstants";

type TransactionType = (typeof financeConstants.TRANSACTION_TYPES)[number];

export type { TransactionType as default };
