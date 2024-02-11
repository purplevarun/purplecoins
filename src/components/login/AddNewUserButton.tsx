import { useContext } from "react";
import ButtonText from "../../data/ButtonText.ts";
import LoginContext from "./LoginContext.tsx";
import UserLoginState from "../../data/UserLoginState.ts";
import { API_URL, PASSWORD_LENGTH } from "../../data/Constants.ts";
import Vertical from "../helper/Vertical.tsx";
import axios from "axios";

const AddNewUserButton = () => {
	const { passwordValue, usernameValue, setUserLoginState } =
		useContext(LoginContext);
	const handleClick = () => {
		const newUserData = {
			userName: usernameValue,
			password: passwordValue,
		};
		axios
			.post(`${API_URL}/user`, newUserData)
			.then((result) => {
				if (
					result.status === 200 &&
					result.data.message === "User Added Successfully"
				) {
					console.log("user added");
				}
				console.log("result = ", result.data);
			})
			.catch((err) => {
				console.log("err=", err);
			});
		setUserLoginState(UserLoginState.LOGGED_IN);
	};

	if (passwordValue.length === PASSWORD_LENGTH) {
		return (
			<div>
				<Vertical h={2} />
				<button onClick={handleClick}>{ButtonText.ADD_USER}</button>
			</div>
		);
	}
};
export default AddNewUserButton;
