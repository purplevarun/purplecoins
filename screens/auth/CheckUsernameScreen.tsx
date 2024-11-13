import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { expo } from "../../app.json";
import {
	CENTER,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "../../config/constants.config";
import { SERVER_ERROR } from "../../config/error.config";
import { checkUser } from "../../util/ApiFunctions";
import CustomText from "../../components/CustomText";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import LoadingScreen from "../other/LoadingScreen";
import AuthScreenLayout from "./AuthScreenLayout";
import ErrorMessage from "./ErrorMessage";
import LoggedOutRoutes from "./LoggedOutRoutes";
import HTTP from "../../config/http_codes.config";

const CheckUsernameScreen = () => {
	const [username, setUsername] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { navigate } = useNavigation<any>();

	const handlePress = async () => {
		setLoading(true);
		const { status } = await checkUser(username);
		if (status === HTTP.SERVER_ERROR) setError(SERVER_ERROR);
		else if (status === HTTP.NOT_FOUND)
			navigate(LoggedOutRoutes.SignUp, { username });
		else navigate(LoggedOutRoutes.SignIn, { username });
		setLoading(false);
	};

	if (loading) return <LoadingScreen />;
	return (
		<AuthScreenLayout>
			<CustomText
				text={`Welcome to ${expo.name}`}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<ErrorMessage error={error} />
			<CustomInput
				name={"Username"}
				value={username}
				setValue={setUsername}
			/>
			<CustomButton
				onPress={handlePress}
				disabled={username.length < MINIMUM_LENGTH}
			/>
		</AuthScreenLayout>
	);
};

export default CheckUsernameScreen;
