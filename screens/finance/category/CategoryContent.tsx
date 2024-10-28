import { useQuery } from "@realm/react";
import CategoryModel from "../../../models/CategoryModel";
import { StyleSheet, View } from "react-native";
import CustomText from "../../../components/CustomText";
import { CENTER, FLEX_ONE } from "../../../config/constants.config";
import { DISABLED_COLOR } from "../../../config/colors.config";
import CategorySection from "./CategorySection";
import ExpenseType from "../../../types/ExpenseType";

const CategoryContent = () => {
	const categoryList = useQuery(CategoryModel);
	console.log(categoryList);

	if (categoryList.length === 0)
		return (
			<View style={styles.view}>
				<CustomText
					text={"No categories added"}
					alignSelf={CENTER}
					color={DISABLED_COLOR}
				/>
			</View>
		);

	return (
		<View>
			<CategorySection
				categoryList={categoryList}
				type={ExpenseType.EXPENSE}
			/>
			<CategorySection
				categoryList={categoryList}
				type={ExpenseType.INCOME}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	view: {
		justifyContent: CENTER,
		flex: FLEX_ONE,
	},
});

export default CategoryContent;
