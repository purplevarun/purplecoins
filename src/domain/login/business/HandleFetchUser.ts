import { API_URL } from "../../../data/Constants.ts";
import UserLoginState from "./UserLoginState.ts";
import axios from "axios";
import LoginButtonHandlerProps from "./LoginButtonHandlerProps.ts";
import LoginMessage from "./LoginMessage.ts";

const handleFetchUser = async ({
	usernameValue,
	userLoginState,
	setUserLoginState,
	setLoginScreenText,
}: LoginButtonHandlerProps) => {
	const fetchUserUrl = `${API_URL}/user/fetch?userName=${usernameValue}`;
	if (userLoginState === UserLoginState.NONE) {
		axios
			.get(fetchUserUrl)
			.then((response) => {
				if (
					response.status === 200 &&
					response.data.message === "User exists"
				) {
					// happy-flow user-exists
					setLoginScreenText(LoginMessage.NO_MESSAGE);
					setUserLoginState(UserLoginState.LOGIN);
				}
			})
			.catch(() => {
				setLoginScreenText(LoginMessage.USER_DOES_NOT_EXIST);
				setUserLoginState(UserLoginState.REGISTER);
			});
		return false;
	}
	return true;
};
export default handleFetchUser;
