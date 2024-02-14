import {
	DEFAULT_INPUT_WIDTH,
	DISPLAY_FLEX,
	PASSWORD_LENGTH,
} from "../../../data/Constants.ts";
import { useContext } from "react";
import LoginContext from "../context/LoginContext.tsx";
import UserLoginState from "../../../data/UserLoginState.ts";
import Vertical from "../../../common_components/Vertical.tsx";

const PasswordInput = () => {
	const { userLoginState, setPasswordValue, passwordValue } =
		useContext(LoginContext);
	if (
		userLoginState === UserLoginState.REGISTER ||
		userLoginState === UserLoginState.LOGIN
	) {
		return (
			<div>
				<Vertical h={2} />
				<input
					type="text"
					placeholder="password"
					id="password_input"
					value={passwordValue}
					autoFocus
					onChange={(event) => setPasswordValue(event.target.value)}
					minLength={PASSWORD_LENGTH}
					maxLength={PASSWORD_LENGTH}
					style={{
						display: DISPLAY_FLEX,
						width: DEFAULT_INPUT_WIDTH,
					}}
				/>
			</div>
		);
	}
};
export default PasswordInput;
