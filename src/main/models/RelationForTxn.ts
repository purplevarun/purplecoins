import TransactionRelationType from "../constants/enums/TransactionRelationType";

interface RelationForTxn {
	id: string;
	name: string;
	type: TransactionRelationType;
}

export default RelationForTxn;
