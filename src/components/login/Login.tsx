import Layout from "../layout/Layout.tsx";
import Vertical from "../helper/Vertical.tsx";
import UserDoesNotExist from "./UserDoesNotExist.tsx";
import UsernameInput from "./UsernameInput.tsx";
import LoginButton from "./LoginButton.tsx";
import LoginData from "./LoginData.tsx";
import LoginContext from "./LoginContext.tsx";

const Login = () => {
	return (
		<LoginContext.Provider value={LoginData()}>
			<Layout extraStyles={{ alignItems: "center" }}>
				<Vertical h={28} />
				<UserDoesNotExist />
				<UsernameInput />
				<Vertical h={2} />
				<LoginButton />
			</Layout>
		</LoginContext.Provider>
	);
};
export default Login;
