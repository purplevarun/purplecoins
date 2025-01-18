import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import { sourceRoutes } from "../../app/router/Routes";
import useScreen from "../../hooks/useScreen";
import ITransaction from "../transaction/ITransaction";
import ISource from "./ISource";

const useSource = (id: string = "") => {
	const db = useSQLiteContext();
	const { navigate } = useScreen();
	const [name, setName] = useState("");
	const [amount, setAmount] = useState("");
	const [sources, setSources] = useState<ISource[]>([]);

	const enabled = useMemo(() => {
		if (name === "") return false;
		if (amount === "") return true;
		const parsedAmount = Number(amount);
		return !isNaN(parsedAmount);
	}, [name, amount]);

	const iAmount = useMemo(() => {
		if (amount === "") return 0;
		return parseInt(amount);
	}, [amount]);

	const fetchSources = () => {
		return db.getAllSync<ISource>(select_all_sources);
	};

	const addSource = () => {
		db.runSync(insert_source, [randomUUID(), name.trim(), iAmount]);
		navigate(sourceRoutes.main);
	};

	const handlePlus = () => {
		navigate(sourceRoutes.add);
	};

	const handleClose = () => {
		navigate(sourceRoutes.main);
	};

	const fetchOneSource = () => {
		return db.getFirstSync<ISource>(select_source, [id]) as ISource;
	};

	const fetchTransactionForSource = () => {
		return db.getAllSync<ITransaction>(select_transactions_for_source, [
			id,
		]);
	};

	const updateOneSource = () => {
		db.runSync(update_source, [name, id]);
		navigate(sourceRoutes.main);
	};

	const deleteOneSource = () => {
		db.runSync(delete_source, [id]);
		navigate(sourceRoutes.main);
	};

	const handleEdit = () => {
		navigate(sourceRoutes.edit, id);
	};

	const handleEditFocus = () => {
		const source = fetchOneSource();
		setName(source.name);
	};

	const handleDetail = () => {
		navigate(sourceRoutes.detail, id);
	};

	const handleMainFocus = () => {
		setSources(fetchSources());
	};

	const sourceModels = fetchSources().map((s) => ({
		label: s.name,
		value: s.id,
	}));

	const destinationModels = fetchSources()
		.filter((destination) => destination.id !== id)
		.map((source) => ({
			label: source.name,
			value: source.id,
		}));

	return {
		name,
		setName,
		amount,
		setAmount,
		sources,
		enabled,
		iAmount,
		sourceModels,
		destinationModels,
		fetchSources,
		fetchOneSource,
		fetchTransactionForSource,
		addSource,
		updateOneSource,
		deleteOneSource,
		handlePlus,
		handleClose,
		handleEdit,
		handleDetail,
		handleMainFocus,
		handleEditFocus,
	};
};

const select_source = `
	SELECT *
	FROM "source"
	WHERE id = ?;
`;

const select_all_sources = `
	SELECT *
	FROM "source"
	ORDER BY amount DESC;
`;

const update_source = `
	UPDATE "source"
	SET name = ?
	WHERE id = ?;
`;

const delete_source = `
	DELETE FROM "source"
	WHERE id = ?; 
`;

export const insert_source = `
	INSERT
	INTO "source" (id, name, amount)
	VALUES (?, ?, ?);
`;

const select_transactions_for_source = `
	SELECT *
	FROM "transaction"
	WHERE sourceId = ?;
`;

export default useSource;
