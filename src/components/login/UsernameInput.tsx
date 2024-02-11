import {
	DEFAULT_INPUT_WIDTH,
	EXPANDED_INPUT_WIDTH,
	USERNAME_MAX_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../../data/Constants.ts";
import { useContext } from "react";
import LoginContext from "./LoginContext.tsx";
import UserLoginState from "../../data/UserLoginState.ts";

const UsernameInput = () => {
	const { usernameValue, setUsernameValue, userLoginState } =
		useContext(LoginContext);
	const isUsernameLong = usernameValue.length >= USERNAME_MAX_LENGTH / 2;
	const width = isUsernameLong ? EXPANDED_INPUT_WIDTH : DEFAULT_INPUT_WIDTH;
	const isNewUser = userLoginState === UserLoginState.REGISTER_USER;
	return (
		<input
			type="text"
			placeholder="username"
			id="username_input"
			value={usernameValue}
			disabled={isNewUser}
			onChange={(event) => setUsernameValue(event.target.value)}
			minLength={USERNAME_MIN_LENGTH}
			maxLength={USERNAME_MAX_LENGTH}
			style={{
				display: "flex",
				width,
				background: isNewUser ? "lightgrey" : "none",
			}}
		/>
	);
};
export default UsernameInput;
