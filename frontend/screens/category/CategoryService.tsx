import { generateUUID } from "../../HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import useCategoryStore from "./CategoryStore";
import ICategory from "../../interfaces/ICategory";
import ITransaction from "../../interfaces/ITransaction";
import IUser from "../../interfaces/IUser";
import {
	fetch_all_category,
	fetch_single_category,
	fetch_transactions_for_category, insert_category,
	select_all_users,
} from "../../config/queries.config";
import Routes from "../../Routes";

const useCategoryService = () => {
	const db = useSQLiteContext();
	const userId = (db.getFirstSync<IUser>(select_all_users) as IUser).id;
	const { name, setName, currentId, setCurrentId } = useCategoryStore();
	const { navigate } = useNavigation<any>();

	const addNewCategory = () => {
		try {
			const id = generateUUID();
			db.runSync(insert_category, [id, userId, name]);
		} catch {
			console.log("ERROR: CREATING CATEGORY");
		}
		clearStore();
		navigate(Routes.Category.Main);
	};

	const fetchCategories = () => {
		try {
			const categories = db.getAllSync<ICategory>(fetch_all_category, [
				userId,
			]);
			console.log("FETCHED CATEGORIES", categories);
			return categories;
		} catch {
			console.log("ERROR: FETCHING CATEGORIES");
			return [];
		}
	};

	const selectCategory = (categoryId: string) => {
		setCurrentId(categoryId);
		navigate(Routes.Category.Detail);
	};

	const fetchCategory = () => {
		return db.getFirstSync<ICategory>(fetch_single_category, [
			currentId,
		]) as ICategory;
	};

	const handleEdit = () => {};

	const handleDelete = () => {};

	const fetchTransactions = () => {
		return db.getAllSync<ITransaction>(fetch_transactions_for_category, [
			currentId,
		]);
	};

	const clearStore = () => {
		setName("");
		setCurrentId("");
	};

	return {
		addNewCategory,
		fetchCategories,
		selectCategory,
		fetchCategory,
		handleEdit,
		handleDelete,
		fetchTransactions,
	};
};

export default useCategoryService;
