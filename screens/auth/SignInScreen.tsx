import { expo } from "./../../app.json";
import { useState } from "react";
import { objectify } from "../../util/HelperFunctions";
import { INCORRECT_PASSWORD, SERVER_ERROR } from "../../config/error.config";
import {
	API_URL,
	CENTER,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "../../config/constants.config";
import axios from "axios";
import HTTP from "../../config/http_codes.config";
import CustomInput from "../../components/CustomInput";
import CustomText from "../../components/CustomText";
import AuthScreenLayout from "./AuthScreenLayout";
import Vertical from "../../components/Vertical";
import CustomButton from "../../components/CustomButton";
import LoadingScreen from "../other/LoadingScreen";
import ErrorMessage from "./ErrorMessage";
import UserModel from "../../models/UserModel";
import { useRealm } from "@realm/react";

const SignInScreen = ({ route }: { route: any }) => {
	const { username } = route.params;
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const realm = useRealm();

	const handlePress = async () => {
		setLoading(true);
		const url = `${API_URL}/verify-user?name=${username}&password=${password}`;
		const { data } = await axios.get(url);
		console.log(url, objectify(data));
		if (data.status === HTTP.SERVER_ERROR) {
			setError(SERVER_ERROR);
		} else if (data.status === HTTP.INVALID_REQUEST) {
			setError(INCORRECT_PASSWORD);
		} else {
			realm.write(() => {
				realm.create(UserModel, {
					id: data.user_id,
					name: data.user_name,
				});
			});
		}
		setLoading(false);
	};

	if (loading) return <LoadingScreen />;
	return (
		<AuthScreenLayout>
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
			/>
			<CustomButton
				text={"Sign In"}
				disabled={password.length < MINIMUM_LENGTH}
				onPress={handlePress}
			/>
		</AuthScreenLayout>
	);
};

export default SignInScreen;
