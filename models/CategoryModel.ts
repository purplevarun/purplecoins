import { Realm } from "@realm/react";
import ExpenseType from "../types/ExpenseType";

class CategoryModel extends Realm.Object<CategoryModel> {
	id!: string;
	name!: string;
	type!: ExpenseType;

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
