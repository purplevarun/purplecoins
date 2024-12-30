import { FC } from "react";
import { FlatList, View } from "react-native";
import { CENTER, PADDING, FIFTY_P } from "./constants.config";
import CustomText from "./CustomText";
import CategoryRenderItem from "./CategoryRenderItem";
import TransactionType from "./TransactionType";
import ICategory from "./ICategory";

type Props = FC<{
	categoryList: ICategory[];
	type: TransactionType;
}>;

const CategorySection: Props = ({ categoryList, type }) => {
	const filteredList = categoryList.filter((x) => x.type === type);
	const text =
		type === TransactionType.EXPENSE
			? "Expense Categories"
			: "Income Categories";
	return (
		<View style={{ height: FIFTY_P }}>
			<View style={{ marginVertical: PADDING }}>
				<CustomText text={text} alignSelf={CENTER} />
			</View>
			<View style={{ height: PADDING }} />
			{filteredList.length > 0 && (
				<FlatList
					data={filteredList}
					renderItem={({ item }) => (
						<CategoryRenderItem item={item} />
					)}
				/>
			)}
		</View>
	);
};

export default CategorySection;
