import TransactionRelationType from "./TransactionRelationType";

interface TransactionRelation {
	transaction_id: string;
	relation_id: string;
	type: TransactionRelationType;
}

export default TransactionRelation;
