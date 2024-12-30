import {
	fetch_all_sources,
	fetch_transactions_for_source,
	insert_source,
	select_all_sources,
	select_all_users,
} from "./queries.config";
import { useNavigation } from "@react-navigation/native";
import { generateUUID } from "./HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import ISource from "./ISource";
import useSourceStore from "./SourceStore";
import useTransactionStore from "./TransactionStore";
import IUser from "./IUser";
import Routes from "./Routes";
import ITransaction from "./ITransaction";

const useSourceService = () => {
	const db = useSQLiteContext();
	const userId = (db.getFirstSync<IUser>(select_all_users) as IUser).id;
	const { name, setName, initialAmount, setInitialAmount } = useSourceStore();
	const { sourceId, setSourceId } = useTransactionStore();
	const { navigate } = useNavigation<any>();

	const fetchSources = () => {
		try {
			return db.getAllSync<ISource>(select_all_sources, [userId]);
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
			db.runSync(insert_source, [id, userId, name, iAmount, iAmount]);
			console.log("ADDED NEW SOURCE", name);
		} catch {
			console.log("ERROR ADDING SOURCE");
		}
		clearStore();
		navigate(Routes.Source.Main);
	};

	const clearStore = () => {
		setName("");
		setInitialAmount("");
	};

	const fetchSource = (sourceId: string) => {
		return db.getFirstSync<ISource>(fetch_all_sources, [
			sourceId,
		]) as ISource;
	};

	const fetchTransactionsForSource = (sourceId: string) => {
		return db.getAllSync<ITransaction>(fetch_transactions_for_source, [
			sourceId,
		]);
	};

	return {
		fetchSources,
		addNewSource,
		clearStore,
		fetchSource,
		fetchTransactionsForSource,
	};
};

export default useSourceService;
