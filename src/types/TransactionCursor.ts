import type Transaction from "@/types/Transaction";

type TransactionCursor = Pick<Transaction, "createdAt" | "id">;

export type { TransactionCursor as default };
