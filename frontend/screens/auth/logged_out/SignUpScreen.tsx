import { expo } from "../../../app.json";
import { useState } from "react";
import { createNewUser } from "../../../config/api.config";
import {
	CENTER,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "../../../config/constants.config";
import { SERVER_ERROR, USER_EXISTS } from "../../../config/error.config";
import HTTP from "../../../config/http_codes.config";
import CustomInput from "../../../components/CustomInput";
import CustomText from "../../../components/CustomText";
import Vertical from "../../../components/Vertical";
import LoadingScreen from "../../other/LoadingScreen";
import CustomButton from "../../../components/CustomButton";
import ErrorMessage from "./ErrorMessage";
import useAuthService from "../AuthService";
import ScreenLayout from "../../../components/ScreenLayout";

const SignUpScreen = ({ route }: any) => {
	const { username } = route.params;
	const { addNewUser } = useAuthService();
	const [pin1, setPin1] = useState("");
	const [pin2, setPin2] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handlePress = async () => {
		try {
			setLoading(true);
			const { status, userId } = await createNewUser(username, pin1);
			if (status === HTTP.SERVER_ERROR) setError(SERVER_ERROR);
			else if (status === HTTP.INVALID_REQUEST) setError(USER_EXISTS);
			else addNewUser(userId, username);
			setLoading(false);
		} catch (error) {}
	};

	if (loading) return <LoadingScreen />;
	return (
		<ScreenLayout>
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
				value={pin1}
				setValue={setPin1}
				password
				numeric
			/>
			<Vertical />
			<CustomInput
				name={"Confirm Password"}
				value={pin2}
				setValue={setPin2}
				password
				numeric
			/>
			<CustomButton
				text={"Sign Up"}
				onPress={handlePress}
				disabled={pin1 !== pin2 || pin1.length < MINIMUM_LENGTH}
			/>
		</ScreenLayout>
	);
};

export default SignUpScreen;
