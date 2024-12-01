import { generateUUID, logger } from "../../../util/helpers/HelperFunctions";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { ICategory } from "../../../util/database/DatabaseSchema";
import useAuthService from "../../auth/AuthService";
import useCategoryStore from "./CategoryStore";
import CategoryRoutes from "./CategoryRoutes";

const useCategoryService = () => {
	const db = useSQLiteContext();
	const { getUserId } = useAuthService();
	const { categoryName, categoryType, setCategoryName } = useCategoryStore();
	const { navigate } = useNavigation<any>();

	const addNewCategory = () => {
		try {
			const query = "INSERT INTO category (id, userId, name, type) VALUES (?, ?, ?, ?)";
			const userId = getUserId();
			const id = generateUUID();
			db.runSync(query, [id, userId, categoryName, categoryType]);
			setCategoryName("");
			navigate(CategoryRoutes.Main);
		} catch (e) {
			logger("ERROR: creating category", e);
		}
	};

	const fetchCategory = () => {
		try {
			const query = "SELECT * from category where userId=?";
			const userId = getUserId();
			const categories = db.getAllSync<ICategory>(query, [userId]);
			logger("fetched categories", categories);
			return categories;
		} catch (e) {
			logger("ERROR: fetching categories", e);
			return [];
		}
	};

	return { addNewCategory, fetchCategory };
};

export default useCategoryService;