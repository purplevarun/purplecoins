import UserLoginState from "../../../data/UserLoginState.ts";
import { NavigateFunction } from "react-router-dom";

type LoginButtonHandlerProps = {
	usernameValue: string;
	userLoginState: UserLoginState;
	setUserLoginState: (value: UserLoginState) => void;
	userRequestBody: { userName: string; password: string };
	navigate: NavigateFunction;
	setLoggedInUserName: (value: string) => void;
};
export default LoginButtonHandlerProps;
