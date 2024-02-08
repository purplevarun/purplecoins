import ButtonText from "../../data/ButtonText.ts";
import { useContext } from "react";
import LoginContext from "./LoginContext.tsx";
import UserLoginState from "../../data/UserLoginState.ts";
import { USERNAME_MIN_LENGTH } from "../../data/Constants.ts";

const RegisterButton = () => {
	const { userLoginState, usernameValue } = useContext(LoginContext);
	const handleClick = () => {
		// todo
	};

	if (
		usernameValue.length >= USERNAME_MIN_LENGTH &&
		userLoginState === UserLoginState.NEW_USER
	) {
		return <button onClick={handleClick}>{ButtonText.REGISTER}</button>;
	}
};
export default RegisterButton;
