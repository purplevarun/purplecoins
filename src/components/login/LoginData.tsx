import { useState } from "react";
import UserLoginState from "../../data/UserLoginState.ts";
import LoginButtonText from "../../data/LoginButtonText.ts";

const LoginData = () => {
	const [usernameValue, setUsernameValue] = useState("");
	const [userLoginState, setUserLoginState] = useState(
		UserLoginState.API_NOT_CALLED,
	);
	const [loginButtonText, setLoginButtonText] = useState(
		LoginButtonText.LOGIN,
	);
	return {
		usernameValue,
		setUsernameValue,
		userLoginState,
		setUserLoginState,
		loginButtonText,
		setLoginButtonText,
	};
};
export default LoginData;
