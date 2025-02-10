import TransactionAction from "../constants/enums/TransactionAction";
import TransactionType from "../constants/enums/TransactionType";

interface Transaction {
	id: string;
	amount: number;
	reason: string;
	date: Date;
	type: TransactionType;
	action: TransactionAction;
}

export const amount = (txn: Transaction) =>
	txn.action === TransactionAction.DEBIT ? -txn.amount : txn.amount;

export default Transaction;
