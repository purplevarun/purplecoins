import Action from "./src/main/constants/enums/Action";
import Type from "./src/main/constants/enums/Type";

interface ITransaction {
	id: string;
	amount: number;
	reason: string;
	date: string;
	sourceId: string;
	type: Type;
	action: Action;
	destinationId?: string;
	investmentId?: string;
}

export default ITransaction;
