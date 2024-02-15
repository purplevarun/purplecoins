import { useState } from "react";
import UserLoginState from "../business/UserLoginState.ts";
import LoginMessage from "../business/LoginMessage.ts";

const LoginData = () => {
	const [usernameValue, setUsernameValue] = useState("");
	const [passwordValue, setPasswordValue] = useState("");
	const [userLoginState, setUserLoginState] = useState(UserLoginState.NONE);
	const [loginScreenText, setLoginScreenText] = useState(
		LoginMessage.NO_MESSAGE,
	);
	return {
		usernameValue,
		setUsernameValue,
		passwordValue,
		setPasswordValue,
		userLoginState,
		setUserLoginState,
		loginScreenText,
		setLoginScreenText,
	};
};
export default LoginData;
