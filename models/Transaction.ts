import { Realm } from "@realm/react";

class Transaction extends Realm.Object {
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
			categoryId: "string?",
			tripId: "string?",
			labelId: "string?",
		},
	};
}

export default Transaction;
