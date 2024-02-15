import { API_URL } from "../../../data/Constants.ts";
import UserLoginState from "../../../data/UserLoginState.ts";
import axios from "axios";
import LoginButtonHandlerProps from "./LoginButtonHandlerProps.ts";

const handleFetchUser = async ({
	usernameValue,
	userLoginState,
	setUserLoginState,
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
					setUserLoginState(UserLoginState.LOGIN);
				}
			})
			.catch(() => {
				setUserLoginState(UserLoginState.REGISTER);
			});
	}
};
export default handleFetchUser;
