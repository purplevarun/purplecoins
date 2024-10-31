import { useQuery } from "@realm/react";
import LoggedOutRouter from "./LoggedOutRouter";
import LoggedInScreen from "./LoggedInScreen";
import UserModel from "../../models/UserModel";

const AuthRouter = () => {
	const userModels = useQuery(UserModel);

	if (userModels.isEmpty()) return <LoggedOutRouter />;
	else return <LoggedInScreen />;
};

export default AuthRouter;
