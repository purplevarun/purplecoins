import { verifyUser } from "../../../config/api.config";
import { expo } from "../../../app.json";
import { useState } from "react";
import { INCORRECT_PASSWORD, SERVER_ERROR } from "../../../config/error.config";
import {
	CENTER,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "../../../config/constants.config";
import HTTP from "../../../config/http_codes.config";
import CustomInput from "../../../components/CustomInput";
import CustomText from "../../../components/CustomText";
import Vertical from "../../../components/Vertical";
import CustomButton from "../../../components/CustomButton";
import LoadingScreen from "../../other/LoadingScreen";
import ErrorMessage from "./ErrorMessage";
import useAuthService from "../AuthService";
import ScreenLayout from "../../../components/ScreenLayout";

const SignInScreen = ({ route }: any) => {
	const { username } = route.params;
	const { addNewUser } = useAuthService();
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handlePress = async () => {
		setLoading(true);
		const { status, userId } = await verifyUser(username, password);
		if (status === HTTP.SERVER_ERROR) setError(SERVER_ERROR);
		else if (status === HTTP.INVALID_REQUEST) setError(INCORRECT_PASSWORD);
		else addNewUser(userId, username);
		setLoading(false);
	};

	if (loading) return <LoadingScreen />;
	return (
		<ScreenLayout>
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
				onPress={handlePress}
			/>
		</ScreenLayout>
	);
};

export default SignInScreen;
