import { API_URL, USERNAME_MIN_LENGTH } from "../../data/Constants.ts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import LoginContext from "./LoginContext.tsx";
import UserLoginState from "../../data/UserLoginState.ts";

const LoginButton = () => {
	const navigate = useNavigate();
	const {
		//
		usernameValue,
		setUserLoginState,
		btnText,
		setBtnText,
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
				setBtnText("try again");
			});
	};
	if (usernameValue.length >= USERNAME_MIN_LENGTH) {
		return (
			<button
				style={{
					fontSize: "30px",
					border: "none",
					outline: "none",
					borderRadius: "10px",
					padding: "5px 20px",
				}}
				onClick={handleClick}
			>
				{btnText}
			</button>
		);
	}
};

export default LoginButton;
