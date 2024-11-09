import { View } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "../config/colors.config";
import { CENTER, FONT_SIZE } from "../config/constants.config";
import { useQuery } from "@realm/react";
import { MultiSelect } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import CategoryModel from "../models/CategoryModel";
import ExpenseType from "../types/ExpenseType";
import useTransactionStore from "../screens/finance/transaction/TransactionStore";
import RenderItemType from "../types/RenderItemType";
import dropdownStyle from "../styles/dropdown.style";

const CategorySelector = () => {
	const { type, categories, setCategories } = useTransactionStore();

	const categoryList = useQuery(CategoryModel)
		.filter((category) => category.type === type)
		.map((category) => ({
			label: category.name,
			value: category.id,
		}));

	if (categoryList.length === 0)
		return (
			<View style={dropdownStyle.wrapper}>
				<CustomText
					text={"No categories available"}
					color={DISABLED_COLOR}
					alignSelf={CENTER}
				/>
			</View>
		);

	if (type === ExpenseType.TRANSFER || type === ExpenseType.INVESTMENT)
		return null;

	const selectedItem = (item: RenderItemType) => (
		<View style={dropdownStyle.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	const item = (item: RenderItemType) => (
		<View
			style={[
				dropdownStyle.renderItem,
				categories.includes(item.value) &&
					dropdownStyle.renderItemSelected,
			]}
		>
			<CustomText text={item.label} color={PRIMARY_COLOR} />
		</View>
	);

	return (
		<View style={dropdownStyle.wrapper}>
			<MultiSelect
				placeholder="Select Categories"
				labelField="label"
				valueField="value"
				data={categoryList}
				value={categories}
				onChange={setCategories}
				renderItem={item}
				renderSelectedItem={selectedItem}
				style={dropdownStyle.multiselect}
				placeholderStyle={dropdownStyle.placeholder}
				selectedTextStyle={dropdownStyle.selectedText}
				itemContainerStyle={dropdownStyle.itemContainer}
				containerStyle={dropdownStyle.container}
				itemTextStyle={dropdownStyle.itemText}
				selectedStyle={dropdownStyle.selected}
			/>
		</View>
	);
};

export default CategorySelector;
