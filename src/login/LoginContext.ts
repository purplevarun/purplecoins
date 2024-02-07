import { createContext, Dispatch, SetStateAction } from "react";

interface LoginContextProps {
	usernameValue: string;
	setUsernameValue: Dispatch<SetStateAction<string>>;
	fetchUserApiCalled: boolean;
	setFetchUserApiCalled: Dispatch<SetStateAction<boolean>>;
}

const loginContext = createContext<LoginContextProps>({
	usernameValue: "",
	setUsernameValue: () => {},
	fetchUserApiCalled: false,
	setFetchUserApiCalled: () => {},
});

export default loginContext;
