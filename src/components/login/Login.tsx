import Layout from "../layout/Layout.tsx";
import Vertical from "../helper/Vertical.tsx";
import UserDoesNotExist from "./UserDoesNotExist.tsx";
import UsernameInput from "./UsernameInput.tsx";
import LoginButton from "./LoginButton.tsx";
import LoginData from "./LoginData.tsx";
import RegisterButton from "./RegisterButton.tsx";
import LoginContext from "./LoginContext.tsx";

const Login = () => {
	return (
		<LoginContext.Provider value={LoginData()}>
			<Layout extraStyles={{ alignItems: "center" }}>
				<Vertical h={28} />
				<UserDoesNotExist />
				<UsernameInput />
				<LoginButton />
				<RegisterButton />
			</Layout>
		</LoginContext.Provider>
	);
};
export default Login;
