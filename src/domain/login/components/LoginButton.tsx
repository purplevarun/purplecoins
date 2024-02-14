import {
	API_URL,
	PASSWORD_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../../../data/Constants.ts";
import { useContext } from "react";
import LoginContext from "../context/LoginContext.tsx";
import Vertical from "../../../common_components/Vertical.tsx";
import UserLoginState from "../../../data/UserLoginState.ts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../main/context/AuthContext.tsx";

const LoginButton = () => {
	const { usernameValue, setUserLoginState, userLoginState, passwordValue } =
		useContext(LoginContext);
	const { setLoggedInUserName } = useContext(AuthContext);
	const navigateFunction = useNavigate();
	const handleClick = async () => {
		if (userLoginState === UserLoginState.NONE) {
			// check if user exists
			axios
				.get(`${API_URL}/user/fetch?userName=${usernameValue}`)
				.then((response) => {
					if (
						response.status === 200 &&
						response.data.message === "User exists"
					) {
						setUserLoginState(UserLoginState.LOGIN);
					}
				})
				.catch(() => {
					setUserLoginState(UserLoginState.REGISTER);
				});
		} else if (userLoginState === UserLoginState.LOGIN) {
			// check if password is correct
			axios
				.post(`${API_URL}/user/validate`, {
					userName: usernameValue,
					password: passwordValue,
				})
				.then(
					(response: {
						status: number;
						data: { isPasswordCorrect: boolean };
					}) => {
						if (
							response.status === 200 &&
							response.data.isPasswordCorrect
						) {
							setLoggedInUserName(usernameValue);
							navigateFunction("/");
						}
					},
				)
				.catch(() => {
					setUserLoginState(UserLoginState.LOGIN);
				});
		} else if (userLoginState === UserLoginState.REGISTER) {
			// save user
			axios
				.post(`${API_URL}/user/save`, {
					userName: usernameValue,
					password: passwordValue,
				})
				.then((response) => {
					if (
						response.status === 200 &&
						response.data.message === "User Added Successfully"
					) {
						setLoggedInUserName(usernameValue);
					}
				})
				.catch(() => {
					setUserLoginState(UserLoginState.REGISTER);
				});
		}
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
