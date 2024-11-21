import useDatabase from "../../util/database/DatabaseFunctions";
import LoggedOutRouter from "./logged_out/LoggedOutRouter";
import LoggedInRouter from "./logged_in/LoggedInRouter";
import { useEffect } from "react";
import useStore from "../../util/Zustand";
import { logger } from "../../util/HelperFunctions";

const AuthRouter = () => {
	const { createTables, doesUserExist } = useDatabase();
	const { refreshValue } = useStore();
	createTables();
	useEffect(() => {
		logger("checking if user is logged in");
	}, [refreshValue]);

	if (doesUserExist()) return <LoggedInRouter />;
	else return <LoggedOutRouter />;
};

export default AuthRouter;
