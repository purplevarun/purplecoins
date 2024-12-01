import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ICategory } from "../../../util/database/DatabaseSchema";
import CategoryRoutes from "./CategoryRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import CategorySection from "./CategorySection";
import NoContent from "../../other/NoContent";
import useCategoryService from "./CategoryService";
import ExpenseType from "../../../types/ExpenseType";

const CategoryMain = () => {
	const { fetchCategory } = useCategoryService();
	const [categories, setCategories] = useState<null | ICategory[]>(null);

	useFocusEffect(useCallback(() => setCategories(fetchCategory()), []));

	if (!categories || categories.length === 0)
		return <NoContent categories />;

	return (
		<ScreenLayout>
			<PlusButton to={CategoryRoutes.Add} />
			<CategorySection
				categoryList={categories}
				type={ExpenseType.EXPENSE}
			/>
			<CategorySection
				categoryList={categories}
				type={ExpenseType.INCOME}
			/>
		</ScreenLayout>
	);
};

export default CategoryMain;
