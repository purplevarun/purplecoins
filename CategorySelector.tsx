import { DimensionValue, View } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import HideSelector from "./HideSelector";
import IRenderItem from "./IRenderItem";
import { PRIMARY_COLOR } from "./colors.config";
import { FONT_SIZE } from "./constants.config";
import dropdownStyle from "./dropdown.style";
import useCategory from "./src/main/domains/category/useCategory";

interface Props {
	categories: string[];
	setCategories: (val: string[]) => void;
	width: DimensionValue;
}

const CategorySelector = ({ categories, setCategories, width }: Props) => {
	const { categoryModels } = useCategory();

	if (categoryModels.length === 0) {
		return <HideSelector category />;
	}

	const selectedItem = (item: IRenderItem) => (
		<View style={dropdownStyle.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	const item = (item: IRenderItem) => (
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
		<View style={[dropdownStyle.wrapper, { width }]}>
			<MultiSelect
				placeholder={"Category"}
				labelField={"label"}
				valueField={"value"}
				data={categoryModels}
				value={categories}
				onChange={setCategories}
				renderItem={item}
				renderSelectedItem={selectedItem}
				style={dropdownStyle.dropdown}
				placeholderStyle={dropdownStyle.placeholder}
				selectedTextStyle={dropdownStyle.selectedText}
				itemContainerStyle={dropdownStyle.itemContainer}
				containerStyle={dropdownStyle.container}
				itemTextStyle={dropdownStyle.itemText}
				selectedStyle={dropdownStyle.selected}
				renderRightIcon={() => null}
			/>
		</View>
	);
};

export default CategorySelector;
