import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../screen/Home.tsx";
import Login from "../login/Login.tsx";
import AuthContext from "../../context/auth/AuthContext.tsx";

const RouteManager = () => {
	const { loggedInUserName } = useContext(AuthContext);
	if (loggedInUserName === null) {
		return (
			<Routes>
				<Route path={"/login"} element={<Login />} />
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
