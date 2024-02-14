import { useState } from "react";
import UserLoginState from "../../data/UserLoginState.ts";

const LoginData = () => {
	const [usernameValue, setUsernameValue] = useState("");
	const [passwordValue, setPasswordValue] = useState("");
	const [userLoginState, setUserLoginState] = useState(UserLoginState.NONE);
	return {
		usernameValue,
		setUsernameValue,
		passwordValue,
		setPasswordValue,
		userLoginState,
		setUserLoginState,
	};
};
export default LoginData;