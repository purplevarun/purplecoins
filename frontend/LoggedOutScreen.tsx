import useAuthStore, { Mode } from "./useAuthStore";
import CheckUserScreen from "./CheckUserScreen";
import SignUpScreen from "./SignUpScreen";
import SignInScreen from "./SignInScreen";

const LoggedOutScreen = () => {
	const { mode } = useAuthStore();
	if (mode === Mode.sign_in) {
		return <SignInScreen />;
	} else if (mode === Mode.sign_up) {
		return <SignUpScreen />;
	} else {
		return <CheckUserScreen />;
	}
};

export default LoggedOutScreen;
