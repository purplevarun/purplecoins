import Action from "./Action";
import TransactionType from "./TransactionType";

interface ITransaction {
	id: string;
	amount: number;
	reason: string;
	date: string;
	sourceId: string;
	type: TransactionType;
	action: Action;
	destinationId?: string;
	investmentId?: string;
}

export default ITransaction;
