import { View } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "../config/colors.config";
import { FONT_SIZE, PADDING } from "../config/constants.config";
import { MultiSelect } from "react-native-element-dropdown";
import dropdownStyle from "../styles/dropdown.style";
import useTransactionStore from "../screens/finance/transaction/TransactionStore";
import useCategoryService from "../screens/finance/category/CategoryService";
import CustomText from "./CustomText";
import ExpenseType from "../types/ExpenseType";
import RenderItemType from "../types/RenderItemType";

const CategorySelector = () => {
	const { transactionType, transactionCategoryIds, setTransactionCategoryIds } = useTransactionStore();
	const { fetchCategory } = useCategoryService();

	const categoryList = fetchCategory()
		.filter((category) => category.type === transactionType)
		.map((category) => ({
			label: category.name,
			value: category.id
		}));

	if (transactionType === ExpenseType.TRANSFER || transactionType === ExpenseType.INVESTMENT)
		return null;

	if (categoryList.length === 0)
		return (
			<View
				style={{
					paddingLeft: PADDING * 2,
					paddingVertical: PADDING
				}}
			>
				<CustomText
					text={"No categories available"}
					color={DISABLED_COLOR}
				/>
			</View>
		);

	const selectedItem = (item: RenderItemType) => (
		<View style={dropdownStyle.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	const item = (item: RenderItemType) => (
		<View
			style={[
				dropdownStyle.renderItem,
				transactionCategoryIds.includes(item.value) &&
				dropdownStyle.renderItemSelected
			]}
		>
			<CustomText text={item.label} color={PRIMARY_COLOR} />
		</View>
	);

	return (
		<View style={dropdownStyle.wrapper}>
			<MultiSelect
				placeholder={"Select Categories"}
				labelField={"label"}
				valueField={"value"}
				data={categoryList}
				value={transactionCategoryIds}
				onChange={setTransactionCategoryIds}
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
