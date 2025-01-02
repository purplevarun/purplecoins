import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import CategoryRenderItem from "./CategoryRenderItem";
import useCategoryService from "./CategoryService";
import CustomText from "./CustomText";
import Header from "./Header";
import ICategory from "./ICategory";
import ScreenLayout from "./ScreenLayout";
import { DISABLED_COLOR } from "./colors.config";
import { CENTER, SCREEN_HEIGHT } from "./constants.config";
import useNavigate from "./useNavigate";

const CategoryMain = () => {
	const { fetchCategories } = useCategoryService();
	const [categories, setCategories] = useState<ICategory[]>([]);
	useFocusEffect(useCallback(() => setCategories(fetchCategories()), []));
	const { navigateToCategoryAdd } = useNavigate();
	return (
		<ScreenLayout>
			<Header
				title={"Categories"}
				navigateToAddScreen={navigateToCategoryAdd}
			/>
			{categories.length > 0 ? (
				<FlatList
					data={categories}
					renderItem={({ item }) => (
						<CategoryRenderItem item={item} />
					)}
				/>
			) : (
				<CustomText
					text={"No Categories found"}
					alignSelf={CENTER}
					color={DISABLED_COLOR}
					paddingTop={SCREEN_HEIGHT / 3}
				/>
			)}
		</ScreenLayout>
	);
};

export default CategoryMain;
