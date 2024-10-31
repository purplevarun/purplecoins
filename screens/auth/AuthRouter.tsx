import { useQuery } from "@realm/react";
import { useEffect, useState } from "react";
import { Results } from "realm";
import LoggedOutRouter from "./LoggedOutRouter";
import LoggedInScreen from "./LoggedInScreen";
import UserModel from "../../models/UserModel";
import LoadingScreen from "../other/LoadingScreen";

const AuthRouter = () => {
	const userModels = useQuery(UserModel);
	const [data, setData] = useState<null | Results<UserModel>>(null);

	useEffect(() => {
		setData(userModels);
	}, [data]);

	if (data === null) return <LoadingScreen />;
	else if (data.isEmpty()) return <LoggedOutRouter />;
	else return <LoggedInScreen />;
};

export default AuthRouter;
