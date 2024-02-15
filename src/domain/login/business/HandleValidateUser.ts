import { API_URL } from "../../../data/Constants.ts";
import UserLoginState from "./UserLoginState.ts";
import axios from "axios";
import LoginButtonHandlerProps from "./LoginButtonHandlerProps.ts";
import LoginMessage from "./LoginMessage.ts";

const HandleValidateUser = async ({
	usernameValue,
	userLoginState,
	setUserLoginState,
	userRequestBody,
	navigate,
	setLoggedInUserName,
	setLoginScreenText,
}: LoginButtonHandlerProps) => {
	const validateUserUrl = `${API_URL}/user/validate`;
	if (userLoginState === UserLoginState.LOGIN) {
		axios
			.post(validateUserUrl, userRequestBody)
			.then(
				(response: {
					status: number;
					data: { isPasswordCorrect: boolean };
				}) => {
					if (response.status === 200) {
						if (response.data.isPasswordCorrect) {
							// happy-flow login-success
							setLoginScreenText(LoginMessage.NO_MESSAGE);
							setLoggedInUserName(usernameValue);
							navigate("/");
						} else {
							setLoginScreenText(LoginMessage.INCORRECT_PASSWORD);
						}
					}
				},
			)
			.catch(() => {
				setLoginScreenText(LoginMessage.UNKNOWN_ERROR);
				setUserLoginState(UserLoginState.LOGIN);
			});
		return false;
	}
	return true;
};
export default HandleValidateUser;
