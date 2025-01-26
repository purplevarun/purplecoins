import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { categoryRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import CategoryRenderItem from "./CategoryRenderItem";
import ICategory from "./ICategory";

const CategoryMain = () => {
	const [categories, setCategories] = useState<ICategory[]>([]);
	const { navigate } = useScreen();
	const { fetchAllCategories } = useDatabase();
	const handlePlus = () => navigate(categoryRoutes.add);
	useFocus(() => setCategories(fetchAllCategories()));

	if (categories.length === 0) return <NoContent handlePlus={handlePlus} />;
	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<FlashList
				data={categories}
				renderItem={CategoryRenderItem}
				estimatedItemSize={20}
			/>
		</ScreenLayout>
	);
};

export default CategoryMain;
