import { DimensionValue, StyleSheet, View } from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import IRenderItem from "./IRenderItem";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "./colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FONT_SIZE,
	PADDING,
	PADDING_TOP_ADD_SCREEN,
} from "./constants.config";

const DropdownSelector = ({
	name,
	data,
	width = "90%",
	single,
	multi,
}: {
	name: string;
	data: IRenderItem[];
	width?: DimensionValue;
	single?: {
		value: string | null;
		setValue: (value: string) => void;
	};
	multi?: {
		value: string[];
		setValue: (val: string[]) => void;
	};
}) => {
	const item = (item: IRenderItem) => {
		const isSelected =
			single?.value === item.value ||
			(multi?.value?.includes(item.value) ?? false);
		return (
			<View
				style={[
					style.renderItem,
					isSelected && style.renderItemSelected,
				]}
			>
				<CustomText
					text={item.label}
					color={PRIMARY_COLOR}
					fontSize={FONT_SIZE * 0.75}
				/>
			</View>
		);
	};

	const props = {
		placeholder: name,
		data: data,
		labelField: "label",
		valueField: "value",
		renderItem: item,
		style: style.dropdown,
		placeholderStyle: style.placeholder,
		selectedTextStyle: style.selectedText,
		itemContainerStyle: style.itemContainer,
		containerStyle: style.container,
		itemTextStyle: style.itemText,
		selectedStyle: style.selected,
	};
	if (single)
		return (
			<View style={[style.wrapper, { width }]}>
				<Dropdown
					value={single.value}
					onChange={(item) => single.setValue(item.value)}
					{...props}
				/>
			</View>
		);

	if (multi)
		return (
			<View style={[style.wrapper, { width }]}>
				<MultiSelect
					value={multi.value}
					onChange={multi.setValue}
					visibleSelectedItem={false}
					{...props}
				/>
			</View>
		);
};

const style = StyleSheet.create({
	selected: { alignSelf: CENTER },
	wrapper: {
		paddingTop: PADDING_TOP_ADD_SCREEN,
		alignSelf: CENTER,
	},
	renderItem: {
		padding: PADDING,
	},
	renderItemSelected: {
		backgroundColor: DISABLED_COLOR,
	},
	dropdown: {
		alignSelf: CENTER,
		width: "100%",
		height: FONT_SIZE * 2.5,
		borderWidth: 2,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		borderColor: PRIMARY_COLOR,
		backgroundColor: BACKGROUND_COLOR,
	},
	container: {
		backgroundColor: BACKGROUND_COLOR,
		borderWidth: 1,
		borderTopRightRadius: 3,
		borderTopLeftRadius: 3,
	},
	itemText: {
		color: PRIMARY_COLOR,
	},
	itemContainer: {
		backgroundColor: BACKGROUND_COLOR,
	},
	selectedText: {
		fontSize: FONT_SIZE,
		color: PRIMARY_COLOR,
	},
	placeholder: {
		fontSize: FONT_SIZE,
		color: DISABLED_COLOR,
	},
	renderSelected: {
		borderWidth: 2,
		borderColor: DISABLED_COLOR,
		padding: PADDING / 2,
		marginHorizontal: PADDING / 3,
		marginTop: PADDING / 2,
		left: FONT_SIZE / 1.4,
		borderRadius: BORDER_RADIUS / 1.5,
	},
});

export default DropdownSelector;
