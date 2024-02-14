import { useContext } from "react";
import LoginContext from "../context/LoginContext.tsx";
import UserLoginState from "../../../data/UserLoginState.ts";
import { USERNAME_MIN_LENGTH } from "../../../data/Constants.ts";

const UserDoesNotExist = () => {
	const { userLoginState, usernameValue } = useContext(LoginContext);
	if (
		usernameValue.length >= USERNAME_MIN_LENGTH &&
		userLoginState === UserLoginState.REGISTER
	) {
		return (
			<h3 style={{ position: "absolute", top: "34vh" }}>
				user does not exist
			</h3>
		);
	}
};
export default UserDoesNotExist;
