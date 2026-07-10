import type financeConstants from "@/constants/financeConstants";

type TransactionClassification =
	(typeof financeConstants.TRANSACTION_CLASSIFICATIONS)[number];

export type { TransactionClassification as default };
