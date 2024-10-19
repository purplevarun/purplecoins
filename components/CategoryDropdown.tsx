import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "../config/colors.config";
import { FONT_SIZE } from "../config/dimensions.config";
import { Dropdown } from "react-native-element-dropdown";
import { BORDER_RADIUS, PADDING } from "../config/dimensions.config";
import CustomText from "./CustomText";
import { useQuery } from "@realm/react";
import CategoryModel from "../models/CategoryModel";

const CategoryDropdown = ({ type }: { type: "EXPENSE" | "INCOME" }) => {
	const [selectedValue, setSelectedValue] = useState("");

	const renderItem = (item: { value: string; label: string }) => (
		<View
			style={[
				styles.itemContainer,
				selectedValue === item.value && styles.selectedItemContainer,
			]}
		>
			<CustomText text={item.label} color={PRIMARY_COLOR} />
		</View>
	);

	const categoryList = useQuery(CategoryModel)
		.filter((x) => x.type === type)
		.map((x) => ({
			label: x.name,
			value: x.name,
		}));

	return (
		<View
			style={{
				paddingTop: FONT_SIZE * 0.8,
			}}
		>
			<Dropdown
				placeholder="Select Category"
				placeholderStyle={{
					fontSize: FONT_SIZE,
					color: DISABLED_COLOR,
				}}
				selectedTextStyle={{
					fontSize: FONT_SIZE,
					color: PRIMARY_COLOR,
					backgroundColor: BACKGROUND_COLOR,
				}}
				data={categoryList}
				itemContainerStyle={{
					backgroundColor: BACKGROUND_COLOR,
				}}
				containerStyle={{
					backgroundColor: BACKGROUND_COLOR,
					borderWidth: 1,
					borderTopRightRadius: 3,
					borderTopLeftRadius: 3,
				}}
				itemTextStyle={{
					color: PRIMARY_COLOR,
				}}
				labelField={"label"}
				valueField={"value"}
				value={selectedValue}
				onChange={(item) => setSelectedValue(item.value)}
				style={{
					alignSelf: "center",
					width: "90%",
					height: FONT_SIZE * 2.5,
					borderWidth: 2,
					borderRadius: BORDER_RADIUS,
					padding: PADDING,
					borderColor: PRIMARY_COLOR,
					backgroundColor: BACKGROUND_COLOR,
				}}
				renderItem={renderItem}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	itemContainer: {
		padding: PADDING,
	},
	selectedItemContainer: {
		backgroundColor: DISABLED_COLOR,
	},
});

export default CategoryDropdown;
