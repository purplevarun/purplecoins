import { randomUUID } from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo, useState } from "react";
import ITransaction from "../ITransaction";
import { categoryRoutes } from "../Routes";
import useScreen from "../useScreen";
import ICategory from "./ICategory";

const useCategory = (id: string = "") => {
	const [name, setName] = useState("");
	const [categories, setCategories] = useState<ICategory[]>([]);
	const db = useSQLiteContext();
	const { navigate } = useScreen();

	const disabled = useMemo(() => {
		return name.length === 0;
	}, [name]);

	const handlePlus = () => {
		navigate(categoryRoutes.add);
	};

	const handleClose = () => {
		navigate(categoryRoutes.main);
	};

	const fetchCategories = () => {
		return db.getAllSync<ICategory>(select_all_categories);
	};

	const addCategory = () => {
		db.runSync(insert_category, [randomUUID(), name]);
		navigate(categoryRoutes.main);
	};

	const handleDetail = () => {
		navigate(categoryRoutes.detail, id);
	};

	const fetchOneCategory = () => {
		return db.getFirstSync<ICategory>(select_category, [id]) as ICategory;
	};

	const fetchTransactionsForCategory = () => {
		return db.getAllSync<ITransaction>(select_transactions_for_category);
	};

	const handleEdit = () => {
		navigate(categoryRoutes.edit, id);
	};

	const deleteOneCategory = () => {
		db.runSync(delete_category, [id]);
		db.runSync(delete_transaction_category, [id]);
		navigate(categoryRoutes.main);
	};

	const updateOneCategory = () => {
		db.runSync(update_category, [name, id]);
		navigate(categoryRoutes.main);
	};

	const handleEditFocus = () => {
		const category = fetchOneCategory();
		setName(category.name);
	};

	const handleMainFocus = () => {
		setCategories(fetchCategories());
	};

	return {
		name,
		setName,
		categories,
		disabled,
		handlePlus,
		handleClose,
		fetchCategories,
		addCategory,
		handleDetail,
		fetchOneCategory,
		fetchTransactionsForCategory,
		handleEdit,
		deleteOneCategory,
		updateOneCategory,
		handleEditFocus,
		handleMainFocus,
	};
};

const select_category = `
	SELECT *
	FROM "category"
	WHERE id = ?;
`;

const select_all_categories = `
	SELECT *
	FROM "category";
`;

const insert_category = `
	INSERT
	INTO "category" (id, name)
	VALUES (?, ?);
`;

const select_transactions_for_category = `
	SELECT t.*
	FROM "transaction" t
	JOIN "transaction_category" tc ON t.id = tc.transactionId
	WHERE tc.categoryId = ?;
`;

const delete_category = `
	DELETE
	FROM "category"
	WHERE id = ?;
`;

const delete_transaction_category = `
	DELETE
	FROM "transaction_category"
	WHERE categoryId = ?;
`;

const update_category = `
	UPDATE "category"
	SET name = ?
	WHERE id = ?;
`;

export default useCategory;
