import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Home from "../screen/Home.tsx";
import Login from "../login/Login.tsx";
import { useState } from "react";
import Context from "../../context/Context.ts";
import { FaUser, FaUserSlash } from "react-icons/fa6";

const CustomRouter = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	return (
		<Context.Provider value={{ isLoggedIn, setIsLoggedIn }}>
			<BrowserRouter basename={"/purplecoins"}>
				<div>
					<div id="header">
						<h1 style={{ paddingLeft: "20px" }}>purplecoins</h1>
						{isLoggedIn ? (
							<FaUser
								style={{ paddingRight: "20px" }}
								size={40}
							/>
						) : (
							<FaUserSlash
								style={{ paddingRight: "20px" }}
								size={40}
							/>
						)}
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
