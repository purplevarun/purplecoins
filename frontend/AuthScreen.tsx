import { useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import { select_all_users } from "./config/queries.config";
import IUser from "./interfaces/IUser";
import useAppStore from "./AppStore";
import LoggedOutScreen from "./LoggedOutScreen";
import Router from "./Router";

const AuthScreen = () => {
	const { isReRendering } = useAppStore();
	const db = useSQLiteContext();
	const firstUser = db.getFirstSync<IUser>(select_all_users);
	useFocusEffect(useCallback(() => {}, [isReRendering]));

	return firstUser !== null ? <Router /> : <LoggedOutScreen />;
};

export default AuthScreen;
