import Vertical from "../../../common_components/Vertical.tsx";
import LoginScreenMessage from "../components/LoginScreenMessage.tsx";
import UsernameInput from "../components/UsernameInput.tsx";
import PasswordInput from "../components/PasswordInput.tsx";
import LoginContextProvider from "../context/LoginContextProvider.tsx";
import LoginButton from "../components/LoginButton.tsx";
import LoginScreenLayout from "./LoginScreenLayout.tsx";

const LoginScreen = () => {
	return (
		<LoginContextProvider>
			<LoginScreenLayout>
				<Vertical h={25} />
				<LoginScreenMessage />
				<UsernameInput />
				<PasswordInput />
				<LoginButton />
			</LoginScreenLayout>
		</LoginContextProvider>
	);
};
export default LoginScreen;
