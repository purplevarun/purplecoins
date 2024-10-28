import { useQuery } from "@realm/react";
import { StyleSheet, View } from "react-native";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "../config/colors.config";
import {
	CENTER,
	FONT_SIZE,
	PADDING_TOP_ADD_SCREEN,
} from "../config/constants.config";
import { Dropdown } from "react-native-element-dropdown";
import { BORDER_RADIUS, PADDING } from "../config/constants.config";
import CustomText from "./CustomText";
import CategoryModel from "../models/CategoryModel";
import ExpenseType from "../types/ExpenseType";
import { FC } from "react";

type Props = FC<{
	type: ExpenseType;
	value: string;
	setValue: (value: string) => void;
}>;

const CategoryDropdown: Props = ({ type, value, setValue }) => {
	const renderItem = (item: { value: string; label: string }) => (
		<View
			style={[
				styles.renderItem,
				value === item.value && styles.selectedItemContainer,
			]}
		>
			<CustomText text={item.label} color={PRIMARY_COLOR} />
		</View>
	);

	const categoryList = useQuery(CategoryModel)
		.filter((x) => x.type === type)
		.map((x) => ({
			label: x.name,
			value: x.id,
		}));

	return (
		<View style={styles.wrapper}>
			<Dropdown
				placeholder="Select Category"
				labelField={"label"}
				valueField={"value"}
				data={categoryList}
				value={value}
				onChange={(item) => setValue(item.value)}
				renderItem={renderItem}
				style={styles.dropdown}
				placeholderStyle={styles.placeholder}
				selectedTextStyle={styles.selectedText}
				itemContainerStyle={styles.itemContainer}
				containerStyle={styles.container}
				itemTextStyle={styles.itemText}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		paddingTop: PADDING_TOP_ADD_SCREEN,
	},
	renderItem: {
		padding: PADDING,
	},
	selectedItemContainer: {
		backgroundColor: DISABLED_COLOR,
	},
	dropdown: {
		alignSelf: CENTER,
		width: "90%",
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
		backgroundColor: BACKGROUND_COLOR,
	},
	placeholder: {
		fontSize: FONT_SIZE,
		color: DISABLED_COLOR,
	},
});

export default CategoryDropdown;
