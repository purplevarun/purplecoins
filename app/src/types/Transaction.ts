import type TransactionClassification from "@/types/TransactionClassification";
import type TransactionItem from "@/types/TransactionItem";
import type TransactionType from "@/types/TransactionType";

type Transaction = Readonly<{
	id: string;
	classification: TransactionClassification;
	type: TransactionType;
	sourceId: string;
	destinationSourceId: string | null;
	amount: string;
	toAmount: string | null;
	categoryId: string | null;
	tripId: string | null;
	investmentId: string | null;
	reason: string;
	transactionAt: number;
	createdAt: number;
	updatedAt: number;
	sourceName: string;
	sourceCurrencyCode: string;
	destinationSourceName: string | null;
	destinationCurrencyCode: string | null;
	categoryName: string | null;
	tripName: string | null;
	investmentName: string | null;
	hasAttachment: boolean;
	items: readonly TransactionItem[];
}>;

export type { Transaction as default };
