import {
	API_URL,
	PASSWORD_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../../data/Constants.ts";
import { useContext } from "react";
import LoginContext from "./LoginContext.tsx";
import Vertical from "../helper/Vertical.tsx";
import UserLoginState from "../../data/UserLoginState.ts";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginButton = () => {
	const navigate = useNavigate();
	const { usernameValue, setUserLoginState, userLoginState, passwordValue } =
		useContext(LoginContext);
	const handleClick = async () => {
		if (userLoginState === UserLoginState.NONE) {
			// check if user exists
			axios
				.get(`${API_URL}/user?userName=${usernameValue}`)
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
				.then((response) => {
					if (
						response.status === 200 &&
						response.data.isPasswordCorrect
					) {
						setUserLoginState(UserLoginState.LOGGED_IN);
					}
				})
				.catch(() => {
					setUserLoginState(UserLoginState.LOGIN);
				});
		} else if (userLoginState === UserLoginState.REGISTER) {
			// save user
			axios
				.post(`${API_URL}/user`, {
					userName: usernameValue,
					password: passwordValue,
				})
				.then((response) => {
					if (
						response.status === 200 &&
						response.data.message === "User Added Successfully"
					) {
						setUserLoginState(UserLoginState.LOGGED_IN);
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
