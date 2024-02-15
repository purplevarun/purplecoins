import { API_URL } from "../../../data/Constants.ts";
import UserLoginState from "../../../data/UserLoginState.ts";
import axios from "axios";
import LoginButtonHandlerProps from "./LoginButtonHandlerProps.ts";

const HandleValidateUser = async ({
	usernameValue,
	userLoginState,
	setUserLoginState,
	userRequestBody,
	navigate,
	setLoggedInUserName,
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
					if (
						response.status === 200 &&
						response.data.isPasswordCorrect
					) {
						setLoggedInUserName(usernameValue);
						navigate("/");
					}
				},
			)
			.catch(() => {
				// password entered was incorrect
				setUserLoginState(UserLoginState.LOGIN);
			});
	}
};
export default HandleValidateUser;
