import type Transaction from "@/types/Transaction";

type TransactionCursor = Pick<
	Transaction,
	"transactionAt" | "createdAt" | "id"
>;

export type { TransactionCursor as default };
