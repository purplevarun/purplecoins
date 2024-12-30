import { expo } from "./app.json";
import {
	CENTER,
	FONT_SIZE,
	LARGE_FONT_SIZE,
	MINIMUM_LENGTH,
} from "./constants.config";
import ScreenLayout from "./ScreenLayout";
import Vertical from "./Vertical";
import CustomText from "./CustomText";
import ErrorMessage from "./ErrorMessage";
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import { useSQLiteContext } from "expo-sqlite";
import useAppStore from "./AppStore";
import { checkUser, createNewUser, verifyUser } from "./api.config";
import HTTP from "./http_codes.config";
import { INCORRECT_PASSWORD, SERVER_ERROR, USER_EXISTS } from "./error.config";
import { insert_user } from "./queries.config";
import { create } from "zustand";

const LoggedOutScreen = () => {
	const { mode } = useAuthStore();
	switch (mode) {
		case Mode.null:
			return <CheckUserScreen />;
		case Mode.sign_up:
			return <SignUpScreen />;
		case Mode.sign_in:
			return <SignInScreen />;
	}
};

const CheckUserScreen = () => {
	const { loading, error, username, setUsername } = useAuthStore();
	const { handleCheck } = useAuthService();

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

const useAuthService = () => {
	const db = useSQLiteContext();
	const { triggerReRender } = useAppStore();
	const { username, password, setError, setLoading, setMode, clear } =
		useAuthStore();

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
				db.runSync(insert_user, [userId, username]);
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
				db.runSync(insert_user, [userId, username]);
				triggerReRender();
				clear();
			}
			setLoading(false);
		} catch {
			setError(SERVER_ERROR);
		}
	};

	return { handleCheck, handleSignIn, handleSignUp };
};

enum Mode {
	null,
	sign_up,
	sign_in,
}

interface AuthState {
	username: string;
	password: string;
	confirmPassword: string;
	error: string;
	loading: boolean;
	mode: Mode;
	setUsername: (username: string) => void;
	setPassword: (password: string) => void;
	setConfirmPassword: (confirmPassword: string) => void;
	setError: (error: string) => void;
	setLoading: (loading: boolean) => void;
	setMode: (mode: Mode) => void;
	clear: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
	username: "",
	password: "",
	confirmPassword: "",
	error: "",
	loading: false,
	mode: Mode.null,
	setUsername: (username) => set({ username }),
	setPassword: (password) => set({ password }),
	setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
	setError: (error) => set({ error }),
	setLoading: (loading) => set({ loading }),
	setMode: (mode) => set({ mode }),
	clear: () =>
		set({
			username: "",
			password: "",
			confirmPassword: "",
			error: "",
			loading: false,
			mode: Mode.null,
		}),
}));

export default LoggedOutScreen;
