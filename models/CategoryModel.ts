import { Realm } from "@realm/react";
import ExpenseType from "../types/ExpenseType";

class CategoryModel extends Realm.Object<CategoryModel> {
	id!: string;
	name!: string;
	type!: ExpenseType;
	userId!: string;

	static schema = {
		name: "Category",
		primaryKey: "id",
		properties: {
			id: "string",
			name: "string",
			type: "string",
			userId: "string",
		},
	};
}

export default CategoryModel;
