import {
	insert_source,
	select_all_sources,
	select_all_users,
} from "../../config/queries.config";
import { useNavigation } from "@react-navigation/native";
import { generateUUID } from "../../HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import ISource from "../../interfaces/ISource";
import useSourceStore from "./SourceStore";
import useTransactionStore from "../transaction/TransactionStore";
import IUser from "../../interfaces/IUser";
import Routes from "../../Routes";
import { useMemo } from "react";

const useSourceService = () => {
	const db = useSQLiteContext();
	const userId = (db.getFirstSync<IUser>(select_all_users) as IUser).id;
	const {
		name,
		setName,
		initialAmount,
		setInitialAmount,
		redirect,
		setRedirect,
	} = useSourceStore();
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
		if (redirect) {
			setSourceId(id);
			navigate(Routes.Transaction.Add);
		} else {
			navigate(Routes.Source.Main);
		}
	};

	const clearStore = () => {
		setName("");
		setInitialAmount("");
		setRedirect(false);
	};

	const sourceDropdownData = useMemo(() => {
		const sourceModels = fetchSources().map((source) => ({
			label: source.name,
			value: source.id,
		}));
		return {
			placeholder: "Select Source",
			data: sourceModels,
			selectedValue: sourceId,
			onChange: setSourceId,
			typeCheck: true,
		};
	}, [name]);

	return {
		fetchSources,
		addNewSource,
		clearStore,
		sourceDropdownData,
	};
};

export default useSourceService;
