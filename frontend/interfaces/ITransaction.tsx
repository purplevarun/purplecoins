import TransactionType from "../components/TransactionType";
import ICategory from "./ICategory";
import ITrip from "./ITrip";

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

export default ITransaction;