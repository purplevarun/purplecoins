import { useState } from "react";
import UserLoginState from "../../data/UserLoginState.ts";
import ButtonText from "../../data/ButtonText.ts";

const LoginData = () => {
	const [usernameValue, setUsernameValue] = useState("");
	const [passwordValue, setPasswordValue] = useState("");
	const [userLoginState, setUserLoginState] = useState(
		UserLoginState.API_NOT_CALLED,
	);
	const [loginButtonText, setLoginButtonText] = useState(ButtonText.LOGIN);
	return {
		usernameValue,
		setUsernameValue,
		passwordValue,
		setPasswordValue,
		userLoginState,
		setUserLoginState,
		loginButtonText,
		setLoginButtonText,
	};
};
export default LoginData;
