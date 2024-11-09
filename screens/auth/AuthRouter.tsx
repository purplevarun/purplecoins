import { useQuery } from "@realm/react";
import LoggedOutRouter from "./LoggedOutRouter";
import UserModel from "../../models/UserModel";
import ErrorScreen from "../other/ErrorScreen";
import LoggedInRouter from "./LoggedInRouter";

const AuthRouter = () => {
	const userModels = useQuery(UserModel);
	if (userModels === null) return <ErrorScreen message={"No User found"} />;
	if (userModels.isEmpty()) return <LoggedOutRouter />;
	else return <LoggedInRouter />;
};

export default AuthRouter;
