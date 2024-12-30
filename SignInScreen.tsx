import { expo } from "./app.json";
import {
	CENTER,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "./constants.config";
import useAuthStore from "./useAuthStore";
import useAuthService from "./useAuthService";
import ScreenLayout from "./ScreenLayout";
import Vertical from "./Vertical";
import CustomText from "./CustomText";
import ErrorMessage from "./ErrorMessage";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";

const SignInScreen = () => {
	const { username, password, error, setPassword, loading } = useAuthStore();
	const { handleSignIn } = useAuthService();
	return (
		<ScreenLayout loading={loading}>
			<Vertical size={40} />
			<CustomText
				text={`SignIn to ${expo.name}`}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<ErrorMessage error={error} />
			<CustomInput name={"Username"} value={username} disabled />
			<Vertical />
			<CustomInput
				name={"Password"}
				value={password}
				setValue={setPassword}
				password
				numeric
			/>
			<CustomButton
				text={"Sign In"}
				disabled={password.length < MINIMUM_LENGTH}
				onPress={handleSignIn}
				marginV={FONT_SIZE}
			/>
		</ScreenLayout>
	);
};

export default SignInScreen;
