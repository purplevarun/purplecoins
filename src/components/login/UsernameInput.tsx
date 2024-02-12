import {
	DEFAULT_INPUT_WIDTH,
	DISPLAY_FLEX,
	EXPANDED_INPUT_WIDTH,
	USERNAME_MAX_LENGTH,
	USERNAME_MIN_LENGTH,
} from "../../data/Constants.ts";
import { useContext } from "react";
import LoginContext from "./LoginContext.tsx";
import UserLoginState from "../../data/UserLoginState.ts";
import { LIGHT_GREY_COLOR, WHITE_COLOR } from "../../data/Colors.ts";

const UsernameInput = () => {
	const { usernameValue, setUsernameValue, userLoginState } =
		useContext(LoginContext);
	const isUsernameLong = usernameValue.length >= USERNAME_MAX_LENGTH / 2;
	const width = isUsernameLong ? EXPANDED_INPUT_WIDTH : DEFAULT_INPUT_WIDTH;
	const hasEnteredCorrectUsername = userLoginState === UserLoginState.LOGIN;
	return (
		<input
			type="text"
			placeholder="username"
			id="username_input"
			value={usernameValue}
			autoFocus
			disabled={hasEnteredCorrectUsername}
			onChange={(event) => setUsernameValue(event.target.value)}
			minLength={USERNAME_MIN_LENGTH}
			maxLength={USERNAME_MAX_LENGTH}
			style={{
				display: DISPLAY_FLEX,
				width,
				background: hasEnteredCorrectUsername
					? LIGHT_GREY_COLOR
					: WHITE_COLOR,
			}}
		/>
	);
};
export default UsernameInput;
