import Layout from "../../../common_components/Layout.tsx";
import Vertical from "../../../common_components/Vertical.tsx";
import UserDoesNotExist from "../components/UserDoesNotExist.tsx";
import UsernameInput from "../components/UsernameInput.tsx";
import LoginButton from "../components/LoginButton.tsx";
import PasswordInput from "../components/PasswordInput.tsx";
import LoginContextProvider from "../context/LoginContextProvider.tsx";

const LoginScreen = () => {
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
export default LoginScreen;
