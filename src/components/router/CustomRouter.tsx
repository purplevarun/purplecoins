import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "../screen/Home.tsx";
import Login from "../login/Login.tsx";
import { useState } from "react";
import Context from "../../context/Context.ts";

const CustomRouter = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	return (
		<Context.Provider value={{ isLoggedIn, setIsLoggedIn }}>
			<BrowserRouter basename={"/purplecoins"}>
				<div>
					<div id="header">
						<h1>purplecoins</h1>
					</div>
					<div>
						{isLoggedIn ? (
							<Routes>
								<Route path={"/"} element={<Home />} />
								<Route path={"/login"} element={<Login />} />
								<Route
									path={"*"}
									element={<Navigate to={"/login"} replace />}
								/>
							</Routes>
						) : (
							<Routes>
								<Route path={"/login"} element={<Login />} />
								<Route
									path={"*"}
									element={<Navigate to={"/login"} replace />}
								/>
							</Routes>
						)}
					</div>
				</div>
			</BrowserRouter>
		</Context.Provider>
	);
};
export default CustomRouter;
