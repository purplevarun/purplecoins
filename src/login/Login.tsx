import Layout from "../layout/Layout.tsx";
import { useState } from "react";
import Vertical from "../helper/Vertical.tsx";
import UserDoesNotExist from "./UserDoesNotExist.tsx";
import UsernameInput from "./UsernameInput.tsx";
import LoginButton from "./LoginButton.tsx";
import LoginContext from "./LoginContext.ts";

const Login = () => {
	const [usernameValue, setUsernameValue] = useState("");
	const [fetchUserApiCalled, setFetchUserApiCalled] = useState(false);
	return (
		<LoginContext.Provider
			value={{
				usernameValue,
				setUsernameValue,
				fetchUserApiCalled,
				setFetchUserApiCalled,
			}}
		>
			<Layout extraStyles={{ alignItems: "center" }}>
				<Vertical h={28} />
				<UserDoesNotExist />
				<UsernameInput />
				<Vertical h={5} />
				<LoginButton />
			</Layout>
		</LoginContext.Provider>
	);
};
export default Login;
