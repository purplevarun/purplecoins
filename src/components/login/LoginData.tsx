import { useState } from "react";
import UserLoginState from "../../data/UserLoginState.ts";

const LoginData = () => {
	const [usernameValue, setUsernameValue] = useState("");
	const [userLoginState, setUserLoginState] = useState(
		UserLoginState.API_NOT_CALLED,
	);
	const [btnText, setBtnText] = useState("proceed");
	return {
		usernameValue,
		setUsernameValue,
		userLoginState,
		setUserLoginState,
		btnText,
		setBtnText,
	};
};
export default LoginData;
