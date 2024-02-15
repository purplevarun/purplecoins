import { API_URL } from "../../../data/Constants.ts";
import UserLoginState from "../../../data/UserLoginState.ts";
import axios from "axios";
import LoginButtonHandlerProps from "./LoginButtonHandlerProps.ts";

const HandleRegisterUser = async ({
	usernameValue,
	userLoginState,
	setUserLoginState,
	setLoggedInUserName,
	userRequestBody,
}: LoginButtonHandlerProps) => {
	const saveUserUrl = `${API_URL}/user/save`;
	if (userLoginState === UserLoginState.REGISTER) {
		axios
			.post(saveUserUrl, userRequestBody)
			.then((response) => {
				if (
					response.status === 200 &&
					response.data.message === "User Added Successfully"
				) {
					setLoggedInUserName(usernameValue);
				}
			})
			.catch(() => {
				// unable to add new user
				setUserLoginState(UserLoginState.REGISTER);
			});
	}
};
export default HandleRegisterUser;
