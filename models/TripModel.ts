import { Realm } from "@realm/react";

class TripModel extends Realm.Object<TripModel> {
	id!: string;
	name!: string;
	startDate?: Date | null;
	endDate?: Date | null;

	static schema = {
		name: "Trip",
		primaryKey: "id",
		properties: {
			id: "string",
			name: "string",
			startDate: "date?",
			endDate: "date?",
		},
	};
}

export default TripModel;
