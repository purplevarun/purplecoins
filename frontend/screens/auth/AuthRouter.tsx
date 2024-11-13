import useDatabase from "../../util/DatabaseFunctions";
import LoggedOutRouter from "./LoggedOutRouter";
import LoggedInRouter from "./LoggedInRouter";
import useLogger from "../../util/Logger";

const AuthRouter = () => {
	const { user } = useDatabase();
	const { logAll } = useLogger();
	logAll();
	
	if (user.exists) return <LoggedInRouter />;
	else return <LoggedOutRouter />;
};

export default AuthRouter;
