import { API_URL } from "../../../data/Constants.ts";
import UserLoginState from "./UserLoginState.ts";
import axios from "axios";
import LoginButtonHandlerProps from "./LoginButtonHandlerProps.ts";
import LoginMessage from "./LoginMessage.ts";

const HandleRegisterUser = async ({
	usernameValue,
	userLoginState,
	setUserLoginState,
	setLoggedInUserName,
	userRequestBody,
	setLoginScreenText,
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
					// happy-flow register-success
					setLoginScreenText(LoginMessage.NO_MESSAGE);
					setLoggedInUserName(usernameValue);
				}
			})
			.catch(() => {
				setLoginScreenText(LoginMessage.UNKNOWN_ERROR);
				setUserLoginState(UserLoginState.REGISTER);
			});
		return false;
	}
	return true;
};
export default HandleRegisterUser;
