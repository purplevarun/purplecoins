import { ADD_SOURCE, FETCH_SOURCES } from "../../../config/queries.config";
import { useNavigation } from "@react-navigation/native";
import { generateUUID, objectify } from "../../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import ISource from "../../../interfaces/ISource";
import useAuthService from "../../auth/AuthService";
import useSourceStore from "./SourceStore";
import SourceRoutes from "./SourceRoutes";
import TransactionRoutes from "../transaction/TransactionRoutes";
import useTransactionStore from "../transaction/TransactionStore";

const useSourceService = () => {
	const db = useSQLiteContext();
	const { getUserId } = useAuthService();
	const {
		name,
		setName,
		initialAmount,
		setInitialAmount,
		redirect,
		setRedirect
	} = useSourceStore();
	const { setSourceId } = useTransactionStore();
	const { navigate } = useNavigation<any>();

	const fetchSources = () => {
		try {
			const userId = getUserId();
			const sources = db.getAllSync<ISource>(FETCH_SOURCES, [userId]);
			console.log("FETCHED SOURCES", objectify(sources));
			return sources;
		} catch {
			console.log("ERROR FETCHING SOURCES");
			return [];
		}
	};

	const addNewSource = () => {
		const id = generateUUID();
		try {
			const userId = getUserId();
			const iAmount = initialAmount.length === 0 ? 0 : parseInt(initialAmount);
			db.runSync(ADD_SOURCE, [id, userId, name, iAmount, iAmount]);
			console.log("ADDED NEW SOURCE", name);
		} catch {
			console.log("ERROR ADDING SOURCE");
		}
		clearStore();
		if (redirect) {
			setSourceId(id);
			navigate(TransactionRoutes.Add);
		} else {
			navigate(SourceRoutes.Main);
		}
	};

	const clearStore = () => {
		setName("");
		setInitialAmount("");
		setRedirect(false);
	};

	return {
		fetchSources,
		addNewSource,
		clearStore
	};
};

export default useSourceService;