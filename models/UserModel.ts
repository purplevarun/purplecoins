import { Realm } from "@realm/react";

class UserModel extends Realm.Object<UserModel> {
	id!: string;
	name!: string;

	static schema = {
		name: "User",
		primaryKey: "id",
		properties: {
			id: "string",
			name: "string",
		},
	};
}

export default UserModel;
