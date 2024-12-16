import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import CategoryRoutes from "./CategoryRoutes";
import ScreenLayout from "../../../components/ScreenLayout";
import PlusButton from "../../../components/PlusButton";
import CategorySection from "./CategorySection";
import NoContent from "../../other/NoContent";
import useCategoryService from "./CategoryService";
import TransactionType from "../../../components/TransactionType";
import ICategory from "../../../interfaces/ICategory";

const CategoryMain = () => {
	const { fetchCategories } = useCategoryService();
	const [categories, setCategories] = useState<null | ICategory[]>(null);

	useFocusEffect(useCallback(() => setCategories(fetchCategories()), []));

	if (!categories || categories.length === 0)
		return <NoContent categories />;

	return (
		<ScreenLayout>
			<PlusButton to={CategoryRoutes.Add} />
			<CategorySection
				categoryList={categories}
				type={TransactionType.EXPENSE}
			/>
			<CategorySection
				categoryList={categories}
				type={TransactionType.INCOME}
			/>
		</ScreenLayout>
	);
};

export default CategoryMain;
