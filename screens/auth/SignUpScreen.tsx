import { expo } from "./../../app.json";
import { useState } from "react";
import {
	API_URL,
	CENTER,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "../../config/constants.config";
import { SERVER_ERROR, USER_EXISTS } from "../../config/error.config";
import { useRealm } from "@realm/react";
import { objectify } from "../../util/HelperFunctions";
import axios from "axios";
import HTTP from "../../config/http_codes.config";
import CustomInput from "../../components/CustomInput";
import CustomText from "../../components/CustomText";
import AuthScreenLayout from "./AuthScreenLayout";
import Vertical from "../../components/Vertical";
import LoadingScreen from "../other/LoadingScreen";
import CustomButton from "../../components/CustomButton";
import ErrorMessage from "./ErrorMessage";
import UserModel from "../../models/UserModel";

const SignUpScreen = ({ route }: { route: any }) => {
	const { username } = route.params;
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const realm = useRealm();

	const handlePress = async () => {
		try {
			setLoading(true);
			const url = `${API_URL}/create-user?name=${username}&password=${password}`;
			const { data } = await axios.post(url);
			console.log(url, objectify(data));
			if (data.status === HTTP.SERVER_ERROR) {
				setError(SERVER_ERROR);
			} else if (data.status === HTTP.INVALID_REQUEST) {
				setError(USER_EXISTS);
			} else {
				realm.write(() => {
					realm.create(UserModel, {
						id: data.user_id,
						name: data.user_name,
					});
				});
			}
			setLoading(false);
		} catch (error) {
			console.log(error);
		}
	};

	if (loading) return <LoadingScreen />;
	return (
		<AuthScreenLayout>
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
			/>
			<CustomButton
				onPress={handlePress}
				disabled={password.length < MINIMUM_LENGTH}
				text={"Submit"}
			/>
		</AuthScreenLayout>
	);
};

export default SignUpScreen;
