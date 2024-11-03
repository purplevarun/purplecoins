import { FC } from "react";
import { Results } from "realm";
import { FlatList, View } from "react-native";
import { CENTER, PADDING, FIFTY_P } from "../../../config/constants.config";
import CustomText from "../../../components/CustomText";
import CategoryRenderItem from "./CategoryRenderItem";
import CategoryModel from "../../../models/CategoryModel";
import ExpenseType from "../../../types/ExpenseType";

type Props = FC<{
	categoryList: Results<CategoryModel>;
	type: ExpenseType;
}>;

const CategorySection: Props = ({ categoryList, type }) => {
	const filteredList = categoryList.filter((x) => x.type === type);
	const text =
		type === ExpenseType.EXPENSE
			? "Expense Categories"
			: "Income Categories";
	return (
		<View style={{ height: FIFTY_P }}>
			<View style={{ marginVertical: PADDING }}>
				<CustomText text={text} alignSelf={CENTER} />
			</View>
			<View style={{ height: PADDING }} />
			{filteredList.length > 0 && (
				<FlatList data={filteredList} renderItem={CategoryRenderItem} />
			)}
		</View>
	);
};

export default CategorySection;
