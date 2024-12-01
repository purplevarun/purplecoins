import { logger } from "../../util/helpers/HelperFunctions";
import { useEffect } from "react";
import useDatabase from "../../util/database/DatabaseFunctions";
import LoggedOutRouter from "./logged_out/LoggedOutRouter";
import LoggedInRouter from "./logged_in/LoggedInRouter";
import useAuthService from "./AuthService";
import useAuthStore from "./AuthStore";

const AuthRouter = () => {
	const { createTables } = useDatabase();
	const { doesUserExist } = useAuthService();
	const { refreshValue } = useAuthStore();
	createTables();

	useEffect(() => {
		logger("checking if user is logged in");
	}, [refreshValue]);

	if (doesUserExist()) return <LoggedInRouter />;
	else return <LoggedOutRouter />;
};

export default AuthRouter;
