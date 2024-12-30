import { generateUUID } from "./HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import useCategoryStore from "./CategoryStore";
import ICategory from "./ICategory";
import ITransaction from "./ITransaction";
import IUser from "./IUser";
import {
	fetch_all_categories,
	fetch_single_category,
	fetch_transactions_for_category,
	insert_category,
	select_all_users,
} from "./queries.config";
import Routes from "./Routes";

const useCategoryService = () => {
	const db = useSQLiteContext();
	const userId = (db.getFirstSync<IUser>(select_all_users) as IUser).id;
	const { name, setName } = useCategoryStore();
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
			const categories = db.getAllSync<ICategory>(fetch_all_categories, [
				userId,
			]);
			console.log("FETCHED CATEGORIES", categories);
			return categories;
		} catch {
			console.log("ERROR: FETCHING CATEGORIES");
			return [];
		}
	};

	const fetchCategory = (categoryId: string) => {
		return db.getFirstSync<ICategory>(fetch_single_category, [
			categoryId,
		]) as ICategory;
	};

	const handleEdit = (categoryId: string) => {};

	const handleDelete = (categoryId: string) => {};

	const fetchTransactions = (categoryId: string) => {
		return db.getAllSync<ITransaction>(fetch_transactions_for_category, [
			categoryId,
		]);
	};

	const clearStore = () => {
		setName("");
	};

	return {
		clearStore,
		addNewCategory,
		fetchCategories,
		fetchCategory,
		handleEdit,
		handleDelete,
		fetchTransactions,
	};
};

export default useCategoryService;
