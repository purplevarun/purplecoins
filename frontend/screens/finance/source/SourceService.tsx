import { useNavigation } from "@react-navigation/native";
import { generateUUID, objectify } from "../../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import ISource from "../../../interfaces/ISource";
import useAuthService from "../../auth/AuthService";
import useSourceStore from "./SourceStore";
import SourceRoutes from "./SourceRoutes";

const useSourceService = () => {
	const db = useSQLiteContext();
	const { getUserId } = useAuthService();
	const {
		name,
		setName,
		initialAmount,
		setInitialAmount
	} = useSourceStore();
	const { navigate } = useNavigation<any>();

	const fetchSources = () => {
		try {
			const query = "SELECT * from source where userId=?";
			const userId = getUserId();
			const sources = db.getAllSync<ISource>(query, [userId]);
			console.log("FETCHED SOURCES", objectify(sources));
			return sources;
		} catch {
			console.log("ERROR FETCHING SOURCES");
			return [];
		}
	};

	const addNewSource = () => {
		try {
			const query = "INSERT INTO source (id, userId, name, initialAmount, currentAmount) VALUES (?, ?, ?, ?, ?)";
			const id = generateUUID();
			const userId = getUserId();
			const iAmount = initialAmount.length === 0 ? 0 : parseInt(initialAmount);
			db.runSync(query, [id, userId, name, iAmount, iAmount]);
			console.log("ADDED NEW SOURCE", name);
		} catch {
			console.log("ERROR ADDING SOURCE");
		}
		navigate(SourceRoutes.Main);
	};

	const clearStore = () => {
		setName("");
		setInitialAmount("");
	};

	return {
		fetchSources,
		addNewSource,
		clearStore
	};
};

export default useSourceService;