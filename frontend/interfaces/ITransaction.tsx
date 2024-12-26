import TransactionType from "../components/TransactionType";

interface ITransaction {
	id: string;
	amount: number;
	reason: string;
	date: Date;
	user: string;
	source: string;
	sourceId: string;
	type: TransactionType;
	destination?: string;
	destinationId?: string;
	investment?: string;
	investmentId?: string;
	categories?: string;
	trips?: string;
}

export default ITransaction;
