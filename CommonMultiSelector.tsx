import { DimensionValue, View } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import IRenderItem from "./IRenderItem";
import { PRIMARY_COLOR } from "./colors.config";
import { FONT_SIZE } from "./constants.config";
import dropdownStyle from "./dropdown.style";

const CommonMultiSelector = ({
	name,
	data,
	value,
	onChange,
	width,
}: {
	name: string;
	data: IRenderItem[];
	value: string[];
	onChange: (val: string[]) => void;
	width: DimensionValue;
}) => {
	const selectedItem = (item: IRenderItem) => (
		<View style={dropdownStyle.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	const item = (item: IRenderItem) => (
		<View
			style={[
				dropdownStyle.renderItem,
				value.includes(item.value) && dropdownStyle.renderItemSelected,
			]}
		>
			<CustomText
				text={item.label}
				color={PRIMARY_COLOR}
				fontSize={FONT_SIZE * 0.75}
			/>
		</View>
	);

	return (
		<View style={[dropdownStyle.wrapper, { width }]}>
			<MultiSelect
				placeholder={name}
				labelField={"label"}
				valueField={"value"}
				data={data}
				value={value}
				onChange={onChange}
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

export default CommonMultiSelector;
