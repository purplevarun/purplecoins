import { insert_user, select_all_users } from "./queries.config";
import { useSQLiteContext } from "expo-sqlite";
import { logger } from "./HelperFunctions";
import IUser from "./IUser";

const useService = () => {
	logger("useService called");
	const db = useSQLiteContext();
	const user = db.getFirstSync<IUser>(select_all_users);
	const addNewUser = (userId: string, username: string) => {
		db.runSync(insert_user, [userId, username]);
	};
	return { user, addNewUser };
};

export default useService;
