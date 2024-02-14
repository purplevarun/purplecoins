import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../home/screen/Home.tsx";
import LoginScreen from "../login/screen/LoginScreen.tsx";
import AuthContext from "../main/context/AuthContext.tsx";

const RouteManager = () => {
	const { loggedInUserName } = useContext(AuthContext);
	if (loggedInUserName === null) {
		return (
			<Routes>
				<Route path={"/login"} element={<LoginScreen />} />
				<Route
					path={"*"}
					element={<Navigate to={"/login"} replace />}
				/>
			</Routes>
		);
	} else {
		return (
			<Routes>
				<Route path={"/"} element={<Home />} />
				<Route path={"*"} element={<Navigate to={"/"} replace />} />
			</Routes>
		);
	}
};
export default RouteManager;
