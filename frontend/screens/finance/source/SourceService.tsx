import { INSERT_SOURCE, SELECT_SOURCES } from "../../../config/queries.config";
import { useNavigation } from "@react-navigation/native";
import { generateUUID } from "../../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import ISource from "../../../interfaces/ISource";
import useAuthService from "../../auth/AuthService";
import useSourceStore from "./SourceStore";
import SourceRoutes from "./SourceRoutes";
import TransactionRoutes from "../transaction/TransactionRoutes";
import useTransactionStore from "../transaction/TransactionStore";

const useSourceService = () => {
	const db = useSQLiteContext();
	const { userId } = useAuthService();
	const {
		name,
		setName,
		initialAmount,
		setInitialAmount,
		redirect,
		setRedirect,
	} = useSourceStore();
	const { setSourceId } = useTransactionStore();
	const { navigate } = useNavigation<any>();

	const fetchSources = () => {
		try {
			return db.getAllSync<ISource>(SELECT_SOURCES, [userId]);
		} catch {
			console.log("ERROR FETCHING SOURCES");
			return [];
		}
	};

	const addNewSource = () => {
		const id = generateUUID();
		try {
			const iAmount =
				initialAmount.length === 0 ? 0 : parseInt(initialAmount);
			db.runSync(INSERT_SOURCE, [id, userId, name, iAmount, iAmount]);
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
		clearStore,
	};
};

export default useSourceService;
