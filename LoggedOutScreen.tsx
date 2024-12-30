import { useState } from "react";
import { checkUser, createNewUser, verifyUser } from "./api.config";
import { INCORRECT_PASSWORD, SERVER_ERROR, USER_EXISTS } from "./error.config";
import { CENTER, FONT_SIZE, LARGE_FONT_SIZE } from "./constants.config";
import useAppStore from "./AppStore";
import HTTP from "./http_codes.config";
import ScreenLayout from "./ScreenLayout";
import Vertical from "./Vertical";
import CustomText from "./CustomText";
import ErrorMessage from "./ErrorMessage";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import useService from "./useService";

const LoggedOutScreen = () => {
	const [mode, setMode] = useState(Mode.null);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const clear = () => {
		setMode(Mode.null);
		setUsername("");
		setPassword("");
		setConfirmPassword("");
		setLoading(false);
		setError("");
	};
	const { triggerReRender } = useAppStore();
	const { addNewUser } = useService();

	const handleCheck = async () => {
		try {
			setLoading(true);
			const { status } = await checkUser(username);
			if (status === HTTP.SERVER_ERROR) {
				setError(SERVER_ERROR);
			} else if (status === HTTP.NOT_FOUND) {
				setMode(Mode.sign_up);
			} else {
				setMode(Mode.sign_in);
			}
			setLoading(false);
		} catch {
			setError(SERVER_ERROR);
		}
	};

	const handleSignUp = async () => {
		try {
			setLoading(true);
			const { status, userId } = await createNewUser(username, password);
			if (status === HTTP.SERVER_ERROR) {
				setError(SERVER_ERROR);
			} else if (status === HTTP.INVALID_REQUEST) {
				setError(USER_EXISTS);
			} else {
				addNewUser(userId, username);
				triggerReRender();
				clear();
			}
			setLoading(false);
		} catch {
			setError(SERVER_ERROR);
		}
	};

	const handleSignIn = async () => {
		try {
			setLoading(true);
			const { status, userId } = await verifyUser(username, password);
			if (status === HTTP.SERVER_ERROR) {
				setError(SERVER_ERROR);
			} else if (status === HTTP.INVALID_REQUEST) {
				setError(INCORRECT_PASSWORD);
			} else {
				addNewUser(userId, username);
				triggerReRender();
				clear();
			}
			setLoading(false);
		} catch {
			setError(SERVER_ERROR);
		}
	};

	const data = {
		[Mode.null]: {
			title: "Welcome to Purplecoins",
			function: handleCheck,
			disabled: username.length <= 1,
		},
		[Mode.sign_in]: {
			title: "Sign In to Purplecoins",
			function: handleSignIn,
			disabled: password.length < 4,
		},
		[Mode.sign_up]: {
			title: "Sign Up for Purplecoins",
			function: handleSignUp,
			disabled: password !== confirmPassword,
		},
	};

	return (
		<ScreenLayout loading={loading}>
			<Vertical size={FONT_SIZE * 2} />
			<CustomText
				text={data[mode].title}
				alignSelf={CENTER}
				fontSize={LARGE_FONT_SIZE}
			/>
			<ErrorMessage error={error} />
			<CustomInput
				name={"Username"}
				value={username}
				setValue={setUsername}
			/>
			{mode !== Mode.null && (
				<CustomInput
					name={"Password"}
					value={password}
					setValue={setPassword}
					password
					numeric
				/>
			)}
			{mode === Mode.sign_up && (
				<CustomInput
					name={"Confirm Password"}
					value={confirmPassword}
					setValue={setConfirmPassword}
					password
					numeric
				/>
			)}
			<CustomButton
				text={"Submit"}
				onPress={data[mode].function}
				disabled={data[mode].disabled}
				marginV={FONT_SIZE}
			/>
		</ScreenLayout>
	);
};

enum Mode {
	null,
	sign_up,
	sign_in,
}

export default LoggedOutScreen;
