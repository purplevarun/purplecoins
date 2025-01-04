import { useNavigation } from "@react-navigation/native";
import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import ITransaction from "../ITransaction";
import { sourceRoutes } from "../Routes";
import {
	delete_one_source,
	fetch_all_sources,
	fetch_transactions_for_source,
	insert_source,
	select_all_sources,
	update_source,
} from "../queries.config";
import ISource from "./ISource";

const useSource = () => {
	const db = useSQLiteContext();
	const { navigate } = useNavigation<any>();
	const [name, setName] = useState("");
	const [amount, setAmount] = useState("");
	const disabled = useMemo(() => {
		if (name.length === 0) return true;
		if (amount === "") return false;
		const parsedAmount = Number(amount);
		return isNaN(parsedAmount);
	}, [name, amount]);
	const iAmount = useMemo(() => {
		if (amount === "") return 0;
		return parseInt(amount);
	}, [amount]);
	const fetchSources = () => db.getAllSync<ISource>(select_all_sources);
	const fetchOneSource = (sourceId: string) =>
		db.getFirstSync<ISource>(fetch_all_sources, [sourceId]) as ISource;
	const fetchTransactionForSource = (sourceId: string) =>
		db.getAllSync<ITransaction>(fetch_transactions_for_source, [sourceId]);
	const addSource = () => {
		db.runSync(insert_source, [randomUUID(), name, iAmount]);
		navigate(sourceRoutes.main);
	};
	const updateOneSource = (id: string) => {
		db.runSync(update_source, [name, id]);
		navigate(sourceRoutes.main);
	};
	const deleteOneSource = (sourceId: string) => {
		db.runSync(delete_one_source, [sourceId]);
		navigate(sourceRoutes.main);
	};
	const handlePlus = () => navigate(sourceRoutes.add);
	const handleClose = () => navigate(sourceRoutes.main);
	const handleEdit = (id: string) => navigate(sourceRoutes.edit, { id });
	return {
		name,
		setName,
		amount,
		setAmount,
		disabled,
		iAmount,
		fetchSources,
		fetchOneSource,
		fetchTransactionForSource,
		addSource,
		updateOneSource,
		deleteOneSource,
		handlePlus,
		handleClose,
		handleEdit,
	};
};

export default useSource;
