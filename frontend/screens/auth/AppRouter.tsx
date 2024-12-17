import LoggedOutRouter from "./logged_out/LoggedOutRouter";
import LoggedInRouter from "./logged_in/LoggedInRouter";
import useAuthService from "./AuthService";

const AppRouter = () => {
	const { doesUserExist } = useAuthService();
	return doesUserExist ? <LoggedInRouter /> : <LoggedOutRouter />;
};

export default AppRouter;
