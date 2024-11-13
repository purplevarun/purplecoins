import useDatabase from "./DatabaseFunctions";
import { objectify } from "./HelperFunctions";

const useLogger = () => {
	const { users, transactions, categories, trips, investments, sources } =
		useDatabase();
	const logAll = () => {
		console.log("USERS", objectify(users));
		console.log("TRANSACTIONS", objectify(transactions));
		console.log("CATEGORIES", objectify(categories));
		console.log("TRIPS", objectify(trips));
		console.log("INVESTMENTS", objectify(investments));
		console.log("SOURCES", objectify(sources));
	};
	return { logAll };
};

export default useLogger;
