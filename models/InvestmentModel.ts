import { Realm } from "@realm/react";

class InvestmentModel extends Realm.Object<InvestmentModel> {
	id!: string;
	name!: string;
	investedAmount?: number;
	currentAmount?: number;

	static schema = {
		name: "Investment",
		primaryKey: "id",
		properties: {
			id: "string",
			name: "string",
			investedAmount: "int?",
			currentAmount: "int?",
		},
	};
}

export default InvestmentModel;
