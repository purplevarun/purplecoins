import TransactionType from "../components/TransactionType";
import ICategory from "./ICategory";
import ITrip from "./ITrip";

interface ITransaction {
	id: string;
	userId: string;
	sourceId: string;
	destinationId?: string;
	investmentId?: string;
	amount: number;
	reason: string;
	type: TransactionType;
	date: Date;
	categories: ICategory[];
	trips: ITrip[];
}

export default ITransaction;