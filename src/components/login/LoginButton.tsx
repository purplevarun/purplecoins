import { API_URL, USERNAME_MIN_LENGTH } from "../../data/Constants.ts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import LoginContext from "./LoginContext.tsx";
import UserLoginState from "../../data/UserLoginState.ts";
import ButtonText from "../../data/ButtonText.ts";
import Vertical from "../helper/Vertical.tsx";

const LoginButton = () => {
	const navigate = useNavigate();
	const {
		//
		usernameValue,
		setUserLoginState,
		loginButtonText,
		setLoginButtonText,
		userLoginState,
	} = useContext(LoginContext);
	const handleClick = async () => {
		axios
			.get(`${API_URL}/user?userName=${usernameValue}`)
			.then((response) => {
				if (
					response.status === 200 &&
					response.data.message === "User exists"
				) {
					setUserLoginState(UserLoginState.EXISTING_USER);
					navigate("/"); //todo: fix this
				}
			})
			.catch(() => {
				setUserLoginState(UserLoginState.NEW_USER);
				setLoginButtonText(ButtonText.TRY_AGAIN);
			});
	};
	if (userLoginState === UserLoginState.REGISTER_USER) {
		return null;
	} else if (usernameValue.length >= USERNAME_MIN_LENGTH) {
		return (
			<div>
				<Vertical h={2} />
				<button onClick={handleClick}>{loginButtonText}</button>
			</div>
		);
	}
};

export default LoginButton;
