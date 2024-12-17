import { generateUUID } from "../../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import useAuthService from "../../auth/AuthService";
import useCategoryStore from "./CategoryStore";
import CategoryRoutes from "./CategoryRoutes";
import ICategory from "../../../interfaces/ICategory";
import TransactionType from "../../../components/TransactionType";
import ITransaction from "../../../interfaces/ITransaction";

const useCategoryService = () => {
	const db = useSQLiteContext();
	const { userId } = useAuthService();
	const { name, setName, setType, type, currentId, setCurrentId } =
		useCategoryStore();
	const { navigate } = useNavigation<any>();

	const addNewCategory = () => {
		try {
			const query =
				"INSERT INTO category (id, userId, name, type) VALUES (?, ?, ?, ?)";
			const id = generateUUID();
			db.runSync(query, [id, userId, name, type]);
		} catch (e) {
			console.log("ERROR: creating category", e);
		}
		clearStore();
		navigate(CategoryRoutes.Main);
	};

	const fetchCategories = () => {
		try {
			const query = "SELECT * from category where userId=?";
			const categories = db.getAllSync<ICategory>(query, [userId]);
			console.log("fetched categories", categories);
			return categories;
		} catch (e) {
			console.log("ERROR: fetching categories", e);
			return [];
		}
	};

	const selectCategory = (categoryId: string) => {
		setCurrentId(categoryId);
		navigate(CategoryRoutes.Detail);
	};

	const fetchCategory = () => {
		return db.getFirstSync<ICategory>("SELECT * from category where id=?", [
			currentId,
		]) as ICategory;
	};

	const handleEdit = () => {};

	const handleDelete = () => {};

	const fetchTransactions = () => {
		return db.getAllSync<ITransaction>(
			`
			SELECT t.* 
			FROM transaction_record t 
			JOIN transaction_category tc ON t.id = tc.transactionId 
			WHERE tc.categoryId = ?;
		`,
			[currentId],
		);
	};

	const clearStore = () => {
		setName("");
		setCurrentId("");
		setType(TransactionType.EXPENSE);
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
