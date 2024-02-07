import { API_URL, USERNAME_MIN_LENGTH } from "../constants/Constants.ts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import LoginContext from "./LoginContext.ts";

const LoginButton = () => {
	const { usernameValue, setFetchUserApiCalled } = useContext(LoginContext);
	const navigate = useNavigate();
	const handleClick = async () => {
		axios
			.get(`${API_URL}/user?userName=${usernameValue}`)
			.then((response) => {
				if (
					response.status === 200 &&
					response.data.message === "User exists"
				) {
					setFetchUserApiCalled(false);
					navigate("/");
				}
			})
			.catch(() => {
				setFetchUserApiCalled(true);
			});
	};
	return (
		<>
			{usernameValue.length >= USERNAME_MIN_LENGTH && (
				<button style={{ fontSize: "30px" }} onClick={handleClick}>
					proceed
				</button>
			)}
		</>
	);
};

export default LoginButton;
