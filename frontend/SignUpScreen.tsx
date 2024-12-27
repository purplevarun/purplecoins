import { expo } from "./app.json";
import {
	CENTER,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "./config/constants.config";
import useAuthStore from "./useAuthStore";
import useAuthService from "./useAuthService";
import ScreenLayout from "./components/ScreenLayout";
import Vertical from "./components/Vertical";
import CustomText from "./components/CustomText";
import ErrorMessage from "./ErrorMessage";
import CustomInput from "./components/CustomInput";
import CustomButton from "./components/CustomButton";

const SignUpScreen = () => {
	const {
		username,
		password,
		confirmPassword,
		error,
		setPassword,
		setConfirmPassword,
		loading,
	} = useAuthStore();
	const { handleSignUp } = useAuthService();
	return (
		<ScreenLayout loading={loading}>
			<Vertical size={40} />
			<CustomText
				text={`SignUp for ${expo.name}`}
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
			<Vertical />
			<CustomInput
				name={"Confirm Password"}
				value={confirmPassword}
				setValue={setConfirmPassword}
				password
				numeric
			/>
			<CustomButton
				text={"Sign Up"}
				onPress={handleSignUp}
				disabled={
					password !== confirmPassword ||
					password.length < MINIMUM_LENGTH
				}
				marginV={FONT_SIZE}
			/>
		</ScreenLayout>
	);
};

export default SignUpScreen;
