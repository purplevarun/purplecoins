import type Transaction from "@/types/Transaction";

type TransactionPage = Readonly<{
	transactions: readonly Transaction[];
	hasMore: boolean;
}>;

export type { TransactionPage as default };
