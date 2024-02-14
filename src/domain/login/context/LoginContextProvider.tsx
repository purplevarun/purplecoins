import { ReactNode } from "react";
import LoginContext from "./LoginContext.tsx";
import LoginData from "./LoginData.tsx";

const LoginContextProvider = ({ children }: { children: ReactNode }) => {
	return (
		<LoginContext.Provider value={LoginData()}>
			{children}
		</LoginContext.Provider>
	);
};
export default LoginContextProvider;
