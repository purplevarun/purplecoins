import { useQuery } from "@realm/react";
import LoggedOutRouter from "./LoggedOutRouter";
import LoggedInScreen from "./LoggedInScreen";
import UserModel from "../../models/UserModel";
import ErrorScreen from "../other/ErrorScreen";

const AuthRouter = () => {
	const userModels = useQuery(UserModel);
	if (userModels === null) return <ErrorScreen message={"No User found"} />;
	if (userModels.isEmpty()) return <LoggedOutRouter />;
	else return <LoggedInScreen />;
};

export default AuthRouter;
