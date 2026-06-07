import type { TransactionClassification } from "@/types/TransactionClassification";
import type { TransactionType } from "@/types/TransactionType";

type TransactionInput = Readonly<{
	id?: string;
	classification: TransactionClassification;
	type: TransactionType;
	sourceId: string;
	destinationSourceId?: string;
	amount: string;
	toAmount?: string;
	categoryId?: string;
	tripId?: string;
	investmentId?: string;
	reason: string;
	transactionAt: number;
}>;

export type { TransactionInput };
