import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import LoginContext from "../context/LoginContext.tsx";
import AuthContext from "../../main/context/AuthContext.tsx";
import {
	PASSWORD_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../../../data/Constants.ts";
import UserLoginState from "../business/UserLoginState.ts";
import Vertical from "../../../common_components/Vertical.tsx";
import handleFetchUser from "../business/HandleFetchUser.ts";
import handleValidateUser from "../business/HandleValidateUser.ts";
import HandleRegisterUser from "../business/HandleRegisterUser.ts";

const LoginButton = () => {
	const navigate = useNavigate();
	const {
		usernameValue,
		setUserLoginState,
		userLoginState,
		passwordValue,
		setLoginScreenText,
	} = useContext(LoginContext);
	const { setLoggedInUserName } = useContext(AuthContext);
	const handleClick = async () => {
		const loginButtonProps = {
			usernameValue,
			userLoginState,
			setUserLoginState,
			setLoggedInUserName,
			navigate,
			userRequestBody: {
				userName: usernameValue,
				password: passwordValue,
			},
			setLoginScreenText,
		};
		if (await handleFetchUser(loginButtonProps)) {
			if (await handleValidateUser(loginButtonProps)) {
				await HandleRegisterUser(loginButtonProps);
			}
		}
	};

	const isNoneState = userLoginState === UserLoginState.NONE;
	const isLoginState = userLoginState === UserLoginState.LOGIN;
	const isRegisterState = userLoginState === UserLoginState.REGISTER;
	const isUsernameValid = usernameValue.length >= USERNAME_MIN_LENGTH;
	const isPasswordValid = passwordValue.length === PASSWORD_LENGTH;
	if (
		(isNoneState && isUsernameValid) ||
		((isLoginState || isRegisterState) &&
			isPasswordValid &&
			isPasswordValid)
	) {
		return (
			<div>
				<Vertical h={2} />
				<button onClick={handleClick}>proceed</button>
			</div>
		);
	}
};
export default LoginButton;
