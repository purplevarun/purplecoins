import { useMemo, useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
	DELETE_USER,
	INSERT_USER,
	SELECT_USERS,
} from "../../config/queries.config";
import useAuthStore from "./AuthStore";
import IUser from "../../interfaces/IUser";

const useAuthService = () => {
	const db = useSQLiteContext();
	const undefinedUser = { id: "undefinedId", name: "undefinedName" };
	const { toggleRefresh, refresh } = useAuthStore();

	const user = useMemo((): IUser => {
		try {
			const firstUser = db.getFirstSync<IUser>(SELECT_USERS);
			if (firstUser) {
				console.log("FETCHED FIRST USER");
				return firstUser;
			}
		} catch (error) {
			console.error("ERROR FETCHING FIRST USER:", error);
		}
		return undefinedUser;
	}, [refresh]);

	const addNewUser = useCallback(
		(userId: string, username: string) => {
			try {
				db.runSync(INSERT_USER, [userId, username]);
				toggleRefresh();
				console.log("CREATED NEW USER");
			} catch (error) {
				console.error("ERROR CREATING USER:", error);
			}
		},
		[refresh],
	);

	const logOut = useCallback(() => {
		try {
			db.runSync(DELETE_USER);
			toggleRefresh();
			console.log("CLEARED USER TABLE");
		} catch (error) {
			console.error("ERROR DELETING USER TABLE:", error);
		}
	}, [refresh]);

	return {
		userName: user.name,
		userId: user.id,
		doesUserExist: user.id !== undefinedUser.id,
		addNewUser,
		logOut,
	};
};

export default useAuthService;
