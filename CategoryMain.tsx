import { FlatList } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import ScreenLayout from "./ScreenLayout";
import PlusButton from "./PlusButton";
import NoContent from "./NoContent";
import useCategoryService from "./CategoryService";
import ICategory from "./ICategory";
import Routes from "./Routes";
import CategoryRenderItem from "./CategoryRenderItem";

const CategoryMain = () => {
	const { fetchCategories } = useCategoryService();
	const [categories, setCategories] = useState<null | ICategory[]>(null);
	useFocusEffect(useCallback(() => setCategories(fetchCategories()), []));
	if (!categories || categories.length === 0) return <NoContent categories />;

	return (
		<ScreenLayout>
			<PlusButton to={Routes.Category.Add} />
			{categories.length > 0 && (
				<FlatList
					data={categories}
					renderItem={({ item }) => (
						<CategoryRenderItem item={item} />
					)}
				/>
			)}
		</ScreenLayout>
	);
};

export default CategoryMain;
