import type TransactionItemInput from "@/types/TransactionItemInput";

type TransactionItemDraft = TransactionItemInput &
	Readonly<{
		key: string;
		categoryName?: string;
	}>;

export type { TransactionItemDraft as default };
