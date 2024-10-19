import { Realm } from "@realm/react";

class TransactionModel extends Realm.Object<TransactionModel> {
	id!: string;
	amount!: number;
	reason!: string;
	type!: string;
	date!: Date;
	userId!: string;
	categoryId?: string;
	tripId?: string;
	labelId?: string;

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
			categoryId: "string",
			tripId: "string?",
			labelId: "string?",
		},
	};
}

export default TransactionModel;
