import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import CategoryRenderItem from "./CategoryRenderItem";
import useCategoryService from "./CategoryService";
import Header from "./Header";
import ICategory from "./ICategory";
import NoContent from "./NoContent";
import ScreenLayout from "./ScreenLayout";
import useNavigate from "./useNavigate";

const CategoryMain = () => {
	const { fetchCategories } = useCategoryService();
	const [categories, setCategories] = useState<ICategory[]>([]);
	useFocusEffect(useCallback(() => setCategories(fetchCategories()), []));
	const { navigateToCategoryAdd } = useNavigate();
	if (categories.length === 0) return <NoContent />;
	return (
		<ScreenLayout>
			<Header handlePlus={navigateToCategoryAdd} />
			<FlatList
				data={categories}
				renderItem={({ item }) => <CategoryRenderItem item={item} />}
			/>
		</ScreenLayout>
	);
};

export default CategoryMain;
