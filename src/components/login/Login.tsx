import Layout from "../layout/Layout.tsx";
import Vertical from "../helper/Vertical.tsx";
import UserDoesNotExist from "./UserDoesNotExist.tsx";
import UsernameInput from "./UsernameInput.tsx";
import LoginButton from "./LoginButton.tsx";
import PasswordInput from "./PasswordInput.tsx";
import LoginContextProvider from "./LoginContextProvider.tsx";

const Login = () => {
	return (
		<LoginContextProvider>
			<Layout extraStyles={{ alignItems: "center" }}>
				<Vertical h={28} />
				<UserDoesNotExist />
				<UsernameInput />
				<PasswordInput />
				<LoginButton />
			</Layout>
		</LoginContextProvider>
	);
};
export default Login;
