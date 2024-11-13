import { View } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "../config/colors.config";
import { FONT_SIZE, PADDING } from "../config/constants.config";
import { MultiSelect } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import useDatabase from "../util/DatabaseFunctions";
import useTransactionStore from "../screens/finance/transaction/TransactionStore";
import dropdownStyle from "../styles/dropdown.style";
import ExpenseType from "../types/ExpenseType";
import RenderItemType from "../types/RenderItemType";

const CategorySelector = () => {
	const { type, categories, setCategories } = useTransactionStore();
	const { categories: categoryModels } = useDatabase();
	const categoryList = categoryModels
		.filter((category) => category.type === type)
		.map((category) => ({
			label: category.name,
			value: category.id,
		}));

	if (type === ExpenseType.TRANSFER || type === ExpenseType.INVESTMENT)
		return null;

	if (categoryList.length === 0)
		return (
			<View
				style={{
					paddingLeft: PADDING * 2,
					paddingVertical: PADDING,
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
