import { useRef, useState } from "react";
import { DimensionValue, StyleSheet, View } from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import CustomInput from "./CustomInput";
import CustomText from "./CustomText";
import DropdownType from "./DropdownType";
import IRenderItem from "./IRenderItem";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "./colors.config";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	FLEX_START,
	FONT_SIZE,
	MARGIN,
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
	name: DropdownType;
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
	const renderRightIcon = () => null;
	const [searchText, setSearchText] = useState("");
	const renderInputSearch = (onSearch: (text: string) => void) => (
		<CustomInput
			value={searchText}
			setValue={(value) => {
				setSearchText(value);
				onSearch(value);
			}}
			name={"Search"}
			autoFocus
			border={false}
			width={"95%"}
		/>
	);
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
		search: true,
		inputSearchStyle: style.inputSearch,
		renderRightIcon,
		renderInputSearch,
	};

	const renderSelectedItem = (item: IRenderItem) => (
		<View style={style.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	const multiSelectRef = useRef<any>();

	if (single)
		return (
			<View style={[style.wrapper, { width }]}>
				<Dropdown
					value={single.value}
					onChange={(item) => {
						single.setValue(item.value);
						setSearchText("");
					}}
					{...props}
				/>
			</View>
		);

	if (multi) {
		return (
			<View style={[style.wrapper, { width }]}>
				<MultiSelect
					ref={multiSelectRef}
					value={multi.value}
					onChange={(values) => {
						multi.setValue(values);
						multiSelectRef.current.close();
						setSearchText("");
					}}
					renderSelectedItem={renderSelectedItem}
					{...props}
				/>
			</View>
		);
	}
};

const style = StyleSheet.create({
	selected: { alignSelf: CENTER },
	wrapper: {
		paddingTop: PADDING_TOP_ADD_SCREEN,
		alignSelf: FLEX_START,
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
		borderWidth: BORDER_WIDTH,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		borderColor: PRIMARY_COLOR,
		backgroundColor: BACKGROUND_COLOR,
	},
	container: {
		width: "85%",
		left: "7.5%",
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
		fontSize: FONT_SIZE * 0.75,
		color: PRIMARY_COLOR,
	},
	placeholder: {
		fontSize: FONT_SIZE * 0.9,
		color: DISABLED_COLOR,
	},
	renderSelected: {
		marginRight: MARGIN,
		marginTop: MARGIN,
		padding: MARGIN,
		borderWidth: BORDER_WIDTH,
		borderColor: DISABLED_COLOR,
		borderRadius: BORDER_RADIUS,
	},
	inputSearch: {
		color: PRIMARY_COLOR,
		borderRadius: BORDER_RADIUS,
	},
});

export default DropdownSelector;
