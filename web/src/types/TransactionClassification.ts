import type { TRANSACTION_CLASSIFICATIONS } from "@/constants/financeConstants";

type TransactionClassification = (typeof TRANSACTION_CLASSIFICATIONS)[number];

export type { TransactionClassification };
