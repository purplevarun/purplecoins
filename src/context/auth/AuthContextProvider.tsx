import AuthContext from "./AuthContext.tsx";
import AuthData from "./AuthData.tsx";
import { ReactNode } from "react";

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
	return (
		<AuthContext.Provider value={AuthData()}>
			{children}
		</AuthContext.Provider>
	);
};
export default AuthContextProvider;
