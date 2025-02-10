import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { categoryRoutes } from "../../app/router/Routes";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import RelationType from "../../constants/enums/RelationType";
import useDatabase from "../../hooks/useDatabase";
import useFocus from "../../hooks/useFocus";
import useScreen from "../../hooks/useScreen";
import Relation from "../../models/Relation";
import CategoryRenderItem from "./CategoryRenderItem";

const CategoryMain = () => {
	const [categories, setCategories] = useState<Relation[]>([]);
	const navigate = useScreen();
	const { fetchAllRelations } = useDatabase();
	useFocus(() => setCategories(fetchAllRelations(RelationType.CATEGORY)));

	if (categories.length === 0)
		return (
			<NoContent
				handlePlus={() => navigate(categoryRoutes.add)}
				text={"Categories"}
			/>
		);
	return (
		<ScreenLayout>
			<Header handlePlus={() => navigate(categoryRoutes.add)} />
			<FlashList
				data={categories}
				renderItem={CategoryRenderItem}
				estimatedItemSize={20}
			/>
		</ScreenLayout>
	);
};

export default CategoryMain;
