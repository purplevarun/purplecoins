import type { TransactionClassification } from "./TransactionClassification";
import type { TransactionType } from "./TransactionType";

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
}>;

export type { Transaction };
