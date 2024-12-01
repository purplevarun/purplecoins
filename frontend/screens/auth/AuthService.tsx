import { IUser } from "../../util/database/DatabaseSchema";
import { logger } from "../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import useAuthStore from "./AuthStore";

const useAuthService = () => {
	const db = useSQLiteContext();
	const { refresh } = useAuthStore();

	const addNewUser = (userId: string, username: string) => {
		try {
			const query = "INSERT INTO user (id, name) VALUES (?, ?)";
			db.runSync(query, [userId, username]);
			refresh();
			logger("created new user");
		} catch (e) {
			logger("ERROR: creating user", e);
		}
	};

	const getUser = () => {
		const undefinedUser = { id: "undefinedId", name: "undefinedName" };
		try {
			const query = "SELECT * from user";
			const firstUser = db.getFirstSync<IUser>(query);
			if (firstUser) {
				logger("fetched first user", firstUser);
				return firstUser;
			} else {
				logger("firstUser is null");
				return undefinedUser;
			}
		} catch (e) {
			logger("ERROR: fetching first user", e);
			return undefinedUser;
		}
	};

	const doesUserExist = () => {
		try {
			const query = "SELECT * from user";
			const users = db.getAllSync<IUser>(query);
			logger("fetched users", users);
			return users != null && users.length > 0;
		} catch (e) {
			logger("ERROR: fetching users", e);
			return false;
		}
	};

	const getUserId = () => {
		return getUser().id;
	};

	const logOut = () => {
		try {
			db.runSync("DROP TABLE user;");
			logger("dropped user table");
		} catch (e) {
			logger("ERROR: deleting user table");
		}
	};

	return { addNewUser, getUserId, getUser, doesUserExist, logOut };
};

export default useAuthService;