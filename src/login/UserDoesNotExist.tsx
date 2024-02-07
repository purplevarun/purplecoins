import { useContext } from "react";
import LoginContext from "./LoginContext.ts";

const UserDoesNotExist = () => {
	const { fetchUserApiCalled } = useContext(LoginContext);
	if (fetchUserApiCalled) {
		return (
			<h3 style={{ position: "absolute", top: "34vh" }}>
				user does not exist
			</h3>
		);
	} else return null;
};
export default UserDoesNotExist;
