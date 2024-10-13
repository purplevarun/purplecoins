import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
	backgroundColor,
	disabledColor,
	primaryColor,
} from "../config/colors.config";
import { FONT_SIZE } from "../config/dimensions.config";
import { Dropdown } from "react-native-element-dropdown";
import { borderRadius, padding } from "../config/style.config";
import ComponentText from "./Component.Text";

const ComponentDropdown = () => {
	const [selectedValue, setSelectedValue] = useState("");

	const renderItem = (item: { value: string; label: string }) => (
		<View
			style={[
				styles.itemContainer,
				selectedValue === item.value && styles.selectedItemContainer,
			]}
		>
			<ComponentText text={item.label} color={primaryColor} />
		</View>
	);

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
					color: disabledColor,
				}}
				selectedTextStyle={{
					fontSize: FONT_SIZE,
					color: primaryColor,
					backgroundColor: backgroundColor,
				}}
				data={[
					{ label: "Java", value: "Java" },
					{ label: "C++", value: ".NET" },
				]}
				itemContainerStyle={{
					backgroundColor: backgroundColor,
				}}
				containerStyle={{
					backgroundColor: backgroundColor,
				}}
				itemTextStyle={{
					color: primaryColor,
				}}
				labelField={"label"}
				valueField={"value"}
				value={selectedValue}
				onChange={(item) => {
					setSelectedValue(item.value);
				}}
				style={{
					alignSelf: "center",
					width: "90%",
					height: FONT_SIZE * 2.5,
					borderWidth: 2,
					borderRadius,
					padding,
					borderColor: primaryColor,
					backgroundColor: backgroundColor,
				}}
				renderItem={renderItem}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	itemContainer: {
		padding,
	},
	selectedItemContainer: {
		backgroundColor: disabledColor,
	},
});

export default ComponentDropdown;
