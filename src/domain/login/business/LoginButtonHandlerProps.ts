import UserLoginState from "./UserLoginState.ts";
import { NavigateFunction } from "react-router-dom";
import LoginMessage from "./LoginMessage.ts";

type LoginButtonHandlerProps = {
	usernameValue: string;
	userLoginState: UserLoginState;
	setUserLoginState: (value: UserLoginState) => void;
	userRequestBody: { userName: string; password: string };
	navigate: NavigateFunction;
	setLoggedInUserName: (value: string) => void;
	setLoginScreenText: (value: LoginMessage) => void;
};
export default LoginButtonHandlerProps;
