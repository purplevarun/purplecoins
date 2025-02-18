import TransactionAction from "./TransactionAction";
import TransactionType from "./TransactionType";

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
