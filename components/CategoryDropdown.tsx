import { StyleSheet, View } from "react-native";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "../config/colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FONT_SIZE,
	PADDING,
	PADDING_TOP_ADD_SCREEN,
	WIDTH_90,
} from "../config/constants.config";
import { FC } from "react";
import { useQuery } from "@realm/react";
import { MultiSelect } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import CategoryModel from "../models/CategoryModel";
import ExpenseType from "../types/ExpenseType";

interface CategoryDropdownProps {
	type: ExpenseType;
	value: string[];
	setValue: (value: string[]) => void;
}

interface RenderItemProps {
	value: string;
	label: string;
}

interface SelectedItemProps {
	label: string;
}

const CategoryDropdown: FC<CategoryDropdownProps> = ({
	type,
	value,
	setValue,
}) => {
	if (type === ExpenseType.TRANSFER) return null;

	const categoryList = useQuery(CategoryModel)
		.filter((category) => category.type === type)
		.map((category) => ({
			label: category.name,
			value: category.id,
		}));

	const renderItem = (item: RenderItemProps) => (
		<View
			style={[
				styles.renderItem,
				value.includes(item.value) && styles.renderItemSelected,
			]}
		>
			<CustomText text={item.label} color={PRIMARY_COLOR} />
		</View>
	);

	const renderSelectedItem = (item: SelectedItemProps) => (
		<View style={styles.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	return (
		<View style={styles.wrapper}>
			<MultiSelect
				placeholder="Select Categories"
				labelField="label"
				valueField="value"
				data={categoryList}
				value={value}
				onChange={setValue}
				renderItem={renderItem}
				renderSelectedItem={renderSelectedItem}
				style={styles.multiselect}
				placeholderStyle={styles.placeholder}
				selectedTextStyle={styles.selectedText}
				itemContainerStyle={styles.itemContainer}
				containerStyle={styles.container}
				itemTextStyle={styles.itemText}
				selectedStyle={styles.selected}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	selected: { alignSelf: CENTER },
	wrapper: {
		paddingTop: PADDING_TOP_ADD_SCREEN,
	},
	renderItem: {
		padding: PADDING,
	},
	renderItemSelected: {
		backgroundColor: DISABLED_COLOR,
	},
	multiselect: {
		alignSelf: CENTER,
		width: WIDTH_90,
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

export default CategoryDropdown;
