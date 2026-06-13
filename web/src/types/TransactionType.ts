import type { TRANSACTION_TYPES } from "@/constants/financeConstants";

type TransactionType = (typeof TRANSACTION_TYPES)[number];

export type { TransactionType };
