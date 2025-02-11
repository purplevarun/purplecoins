import TransactionRelationType from "../constants/enums/TransactionRelationType";

interface LinkedRelation {
	id: string;
	name: string;
	type: TransactionRelationType;
}

export default LinkedRelation;
