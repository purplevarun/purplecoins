import Action from "../../constants/enums/Action";
import Type from "../../constants/enums/Type";

interface ITransaction {
	id: string;
	amount: number;
	reason: string;
	date: Date;
	sourceId: string;
	type: Type;
	action: Action;
	destinationId?: string;
	investmentId?: string;
}

export default ITransaction;
