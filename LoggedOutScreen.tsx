import useAuthStore, { Mode } from "./useAuthStore";
import CheckUserScreen from "./CheckUserScreen";
import SignUpScreen from "./SignUpScreen";
import SignInScreen from "./SignInScreen";

const LoggedOutScreen = () => {
	const { mode } = useAuthStore();
	switch (mode) {
		case Mode.null:
			return <CheckUserScreen />;
		case Mode.sign_up:
			return <SignUpScreen />;
		case Mode.sign_in:
			return <SignInScreen />;
	}
};

export default LoggedOutScreen;
