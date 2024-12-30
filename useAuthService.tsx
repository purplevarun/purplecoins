import { useSQLiteContext } from "expo-sqlite";
import useAppStore from "./AppStore";
import useAuthStore, { Mode } from "./useAuthStore";
import { checkUser, createNewUser, verifyUser } from "./api.config";
import HTTP from "./http_codes.config";
import { INCORRECT_PASSWORD, SERVER_ERROR, USER_EXISTS } from "./error.config";
import { insert_user } from "./queries.config";

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

export default useAuthService;
