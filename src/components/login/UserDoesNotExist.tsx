import { useContext } from "react";
import LoginContext from "./LoginContext.tsx";
import UserLoginState from "../../data/UserLoginState.ts";

const UserDoesNotExist = () => {
	const { userLoginState } = useContext(LoginContext);
	if (userLoginState === UserLoginState.NEW_USER) {
		return (
			<h3 style={{ position: "absolute", top: "34vh" }}>
				user does not exist
			</h3>
		);
	}
};
export default UserDoesNotExist;
