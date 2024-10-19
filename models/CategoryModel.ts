import { Realm } from "@realm/react";

class CategoryModel extends Realm.Object<CategoryModel> {
	id!: string;
	name!: string;
	type!: "INCOME" | "EXPENSE";

	static schema = {
		name: "Category",
		primaryKey: "id",
		properties: {
			id: "string",
			name: "string",
			type: "string",
		},
	};
}

export default CategoryModel;
