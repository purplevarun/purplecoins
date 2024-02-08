import { useContext } from "react";
import ButtonText from "../../data/ButtonText.ts";
import LoginContext from "./LoginContext.tsx";
import UserLoginState from "../../data/UserLoginState.ts";
import { USERNAME_MIN_LENGTH } from "../../data/Constants.ts";
import Vertical from "../helper/Vertical.tsx";

const RegisterButton = () => {
	const { userLoginState, usernameValue, setUserLoginState } =
		useContext(LoginContext);
	const handleClick = () => {
		setUserLoginState(UserLoginState.REGISTER_USER);
	};

	if (
		usernameValue.length >= USERNAME_MIN_LENGTH &&
		userLoginState === UserLoginState.NEW_USER
	) {
		return (
			<div>
				<Vertical h={2} />
				<button onClick={handleClick}>{ButtonText.REGISTER}</button>
			</div>
		);
	}
};
export default RegisterButton;
