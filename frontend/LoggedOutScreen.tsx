import { useSQLiteContext } from "expo-sqlite";
import useAppStore from "./AppStore";
import { useState } from "react";
import { checkUser, createNewUser, verifyUser } from "./config/api.config";
import HTTP from "./config/http_codes.config";
import {
	INCORRECT_PASSWORD,
	SERVER_ERROR,
	USER_EXISTS,
} from "./config/error.config";
import { insert_user } from "./config/queries.config";
import ScreenLayout from "./components/ScreenLayout";
import Vertical from "./components/Vertical";
import CustomText from "./components/CustomText";
import {
	CENTER,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "./config/constants.config";
import ErrorMessage from "./ErrorMessage";
import CustomInput from "./components/CustomInput";
import CustomButton from "./components/CustomButton";
import { expo } from "./app.json";

const LoggedOutScreen = () => {
	const db = useSQLiteContext();
	const { triggerReRender } = useAppStore();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [mode, setMode] = useState<null | "sign_up" | "sign_in">(null);

	const handleCheck = async () => {
		setLoading(true);
		const { status } = await checkUser(username);
		if (status === HTTP.SERVER_ERROR) {
			setError(SERVER_ERROR);
		} else if (status === HTTP.NOT_FOUND) {
			setMode("sign_up");
		} else {
			setMode("sign_in");
		}
		setLoading(false);
	};

	const handleSignUp = async () => {
		try {
			setLoading(true);
			const { status, userId } = await createNewUser(username, password);
			if (status === HTTP.SERVER_ERROR) setError(SERVER_ERROR);
			else if (status === HTTP.INVALID_REQUEST) setError(USER_EXISTS);
			else db.runSync(insert_user, [userId, username]);
			setLoading(false);
			triggerReRender();
		} catch {}
	};

	const handleSignIn = async () => {
		try {
			setLoading(true);
			const { status, userId } = await verifyUser(username, password);
			if (status === HTTP.SERVER_ERROR) setError(SERVER_ERROR);
			else if (status === HTTP.INVALID_REQUEST)
				setError(INCORRECT_PASSWORD);
			else db.runSync(insert_user, [userId, username]);
			setLoading(false);
			triggerReRender();
		} catch {}
	};

	if (mode === "sign_in")
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
					onPress={handleSignIn}
					marginV={FONT_SIZE}
				/>
			</ScreenLayout>
		);
	else if (mode === "sign_up")
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
	else
		return (
			<ScreenLayout loading={loading}>
				<Vertical size={40} />
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
					onPress={handleCheck}
					disabled={username.length < MINIMUM_LENGTH}
					marginV={FONT_SIZE}
				/>
			</ScreenLayout>
		);
};

export default LoggedOutScreen;
