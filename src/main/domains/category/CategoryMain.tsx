import { FlatList } from "react-native";
import Header from "../../components/Header";
import NoContent from "../../components/NoContent";
import ScreenLayout from "../../components/ScreenLayout";
import useFocus from "../../hooks/useFocus";
import CategoryRenderItem from "./CategoryRenderItem";
import useCategory from "./useCategory";

const CategoryMain = () => {
	const { handlePlus, categories, handleMainFocus } = useCategory();
	useFocus(handleMainFocus);

	if (categories.length === 0) return <NoContent handlePlus={handlePlus} />;

	return (
		<ScreenLayout>
			<Header handlePlus={handlePlus} />
			<FlatList data={categories} renderItem={CategoryRenderItem} />
		</ScreenLayout>
	);
};

export default CategoryMain;
