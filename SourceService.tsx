import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { Alert } from "react-native";
import { generateUUID } from "./HelperFunctions";
import ISource from "./ISource";
import ITransaction from "./ITransaction";
import useSourceStore from "./SourceStore";
import {
	fetch_all_sources,
	fetch_transactions_for_source,
	insert_source,
	select_all_sources,
} from "./queries.config";
import { sourceRoutes } from "./Routes";

const useSourceService = () => {
	const db = useSQLiteContext();
	const { name, setName, initialAmount, setInitialAmount } = useSourceStore();
	const { navigate } = useNavigation<any>();

	const fetchSources = () => {
		try {
			return db.getAllSync<ISource>(select_all_sources);
		} catch {
			console.log("ERROR FETCHING SOURCES");
			return [];
		}
	};
	const handleDelete = (sourceId: string) => {
		const { count } = db.getFirstSync<{ count: number }>(
			`select count(*) from transaction_record where sourceId=?`,
			[sourceId],
		) as { count: number };
		if (count > 0) {
			// cant delete source as it is in use
			Alert.alert("Cannot delete source as it is in use");
		} else {
			db.runSync("DELETE FROM source WHERE id=?", [sourceId]);
		}
	};

	const addNewSource = () => {
		const id = generateUUID();
		try {
			const iAmount =
				initialAmount.length === 0 ? 0 : parseInt(initialAmount);
			db.runSync(insert_source, [id, name, iAmount, iAmount]);
			console.log("ADDED NEW SOURCE", name);
		} catch {
			console.log("ERROR ADDING SOURCE");
		}
		clearStore();
		navigate(sourceRoutes.main);
	};
	const deleteSource = (sourceId: string) => {
		db.runSync("DELETE FROM source WHERE id=?", [sourceId]);
		navigate(sourceRoutes.main);
	};

	const updateSource = (sourceId:string)=>{
		db.runSync("UPDATE source SET name=?,initialAmount=? WHERE id=?",[name,initialAmount,sourceId])
		navigate(sourceRoutes.detail,{sourceId});
	}
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
		handleDelete,
		deleteSource
		,updateSource
	};
};

export default useSourceService;
