import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import LoginContext from "../context/LoginContext.tsx";
import AuthContext from "../../main/context/AuthContext.tsx";
import {
	PASSWORD_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../../../data/Constants.ts";
import UserLoginState from "../../../data/UserLoginState.ts";
import Vertical from "../../../common_components/Vertical.tsx";
import handleFetchUser from "../business/HandleFetchUser.ts";
import handleValidateUser from "../business/HandleValidateUser.ts";
import HandleRegisterUser from "../business/HandleRegisterUser.ts";

const LoginButton = () => {
	const navigate = useNavigate();
	const { usernameValue, setUserLoginState, userLoginState, passwordValue } =
		useContext(LoginContext);
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
		};
		await handleFetchUser(loginButtonProps);
		await handleValidateUser(loginButtonProps);
		await HandleRegisterUser(loginButtonProps);
	};
	const Component = (
		<div>
			<Vertical h={2} />
			<button onClick={handleClick}>proceed</button>
		</div>
	);

	if (
		userLoginState === UserLoginState.NONE &&
		usernameValue.length >= USERNAME_MIN_LENGTH
	) {
		return Component;
	} else if (
		userLoginState === UserLoginState.LOGIN &&
		usernameValue.length >= USERNAME_MIN_LENGTH &&
		passwordValue.length === PASSWORD_LENGTH
	) {
		return Component;
	} else if (
		userLoginState === UserLoginState.REGISTER &&
		usernameValue.length >= USERNAME_MIN_LENGTH &&
		passwordValue.length === PASSWORD_LENGTH
	) {
		return Component;
	}
};
export default LoginButton;
