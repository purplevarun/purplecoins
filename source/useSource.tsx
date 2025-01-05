import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import ITransaction from "../ITransaction";
import { sourceRoutes } from "../Routes";
import useScreen from "../useScreen";
import ISource from "./ISource";

const useSource = (id: string = "") => {
	const db = useSQLiteContext();
	const { navigate } = useScreen();
	const [name, setName] = useState("");
	const [amount, setAmount] = useState("");
	const [sources, setSources] = useState<ISource[]>([]);

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

	const fetchSources = () => {
		return db.getAllSync<ISource>(select_all_sources);
	};

	const addSource = () => {
		db.runSync(insert_source, [randomUUID(), name, iAmount]);
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

	return {
		name,
		setName,
		amount,
		setAmount,
		sources,
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

const insert_source = `
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
