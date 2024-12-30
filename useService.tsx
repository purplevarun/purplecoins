import { select_all_users } from "./queries.config";
import { useSQLiteContext } from "expo-sqlite";
import IUser from "./IUser";
import { logger } from "./HelperFunctions";

const useService = () => {
	logger("useService called");
	const db = useSQLiteContext();
	const user = db.getFirstSync<IUser>(select_all_users);
	return { user };
};

export default useService;
