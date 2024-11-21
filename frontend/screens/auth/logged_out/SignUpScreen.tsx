import { expo } from "../../../app.json";
import { useState } from "react";
import { createNewUser } from "../../../config/api.config";
import {
	CENTER,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH
} from "../../../config/constants.config";
import { SERVER_ERROR, USER_EXISTS } from "../../../config/error.config";
import HTTP from "../../../config/http_codes.config";
import CustomInput from "../../../components/CustomInput";
import CustomText from "../../../components/CustomText";
import LoggedOutScreenLayout from "./LoggedOutScreenLayout";
import Vertical from "../../../components/Vertical";
import LoadingScreen from "../../other/LoadingScreen";
import CustomButton from "../../../components/CustomButton";
import ErrorMessage from "./ErrorMessage";
import useDatabase from "../../../util/database/DatabaseFunctions";
import useStore from "../../../util/Zustand";

const SignUpScreen = ({ route }: any) => {
	const { username } = route.params;
	const { createUser } = useDatabase();
	const { refresh } = useStore();
	const [password1, setPassword1] = useState("");
	const [password2, setPassword2] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handlePress = async () => {
		try {
			setLoading(true);
			const { status, userId } = await createNewUser(username, password1);
			if (status === HTTP.SERVER_ERROR) setError(SERVER_ERROR);
			else if (status === HTTP.INVALID_REQUEST) setError(USER_EXISTS);
			else {
				createUser(userId, username);
				refresh();
			}
			setLoading(false);
		} catch (error) {
		}
	};

	if (loading) return <LoadingScreen />;
	return (
		<LoggedOutScreenLayout>
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
				value={password1}
				setValue={setPassword1}
				password
				numeric
			/>
			<Vertical />
			<CustomInput
				name={"Confirm Password"}
				value={password2}
				setValue={setPassword2}
				password
				numeric
			/>
			<CustomButton
				onPress={handlePress}
				disabled={
					password1 !== password2 || password1.length < MINIMUM_LENGTH
				}
			/>
		</LoggedOutScreenLayout>
	);
};

export default SignUpScreen;
