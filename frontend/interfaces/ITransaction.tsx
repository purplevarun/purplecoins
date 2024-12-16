import TransactionType from "../components/TransactionType";

interface ITransaction {
	id: string;
	amount: number;
	reason: string;
	date: Date;
	user: string;
	source: string;
	type: TransactionType;
	destination?: string;
	investment?: string;
	categories?: string;
	trips?: string;
}

export type IGroupedTransactions = { title: string, data: ITransaction[] }[];

export default ITransaction;