import { Realm } from "@realm/react";

class TransactionModel extends Realm.Object<TransactionModel> {
	id!: string;
	amount!: number;
	reason!: string;
	type!: string;
	userId!: string;
	sourceId!: string;
	date!: Date;
	destinationId?: string;
	categories?: string[];
	tripId?: string;
	investmentId?: string;

	static schema = {
		name: "Transaction",
		primaryKey: "id",
		properties: {
			id: "string",
			amount: "int",
			reason: "string",
			type: "string",
			date: "date",
			userId: "string",
			sourceId: "string",
			destinationId: "string?",
			categories: "string?[]",
			tripId: "string?",
			investmentId: "string?",
		},
	};
}

export default TransactionModel;
