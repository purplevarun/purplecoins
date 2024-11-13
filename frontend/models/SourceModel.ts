import { Realm } from "@realm/react";

class SourceModel extends Realm.Object<SourceModel> {
	id!: string;
	name!: string;
	initialAmount!: number;
	amount!: number;

	static schema = {
		name: "Source",
		primaryKey: "id",
		properties: {
			id: "string",
			name: "string",
			initialAmount: "int",
			amount: "int",
		},
	};
}

export default SourceModel;
