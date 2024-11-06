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
	NINETY_P,
	PADDING,
	PADDING_TOP_ADD_SCREEN,
} from "../config/constants.config";
import { useQuery } from "@realm/react";
import { MultiSelect } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import ExpenseType from "../types/ExpenseType";
import useTransactionStore from "../screens/finance/transaction/TransactionStore";
import RenderItemType from "../types/RenderItemType";
import TripModel from "../models/TripModel";

const TripSelector = () => {
	const { type, trips, setTrips } = useTransactionStore();

	const categoryList = useQuery(TripModel).map(({ id, name }) => ({
		label: name,
		value: id,
	}));

	if (type === ExpenseType.TRANSFER || type === ExpenseType.INVESTMENT)
		return null;

	const selectedItem = (item: RenderItemType) => (
		<View style={styles.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	const item = (item: RenderItemType) => (
		<View
			style={[
				styles.renderItem,
				trips.includes(item.value) && styles.renderItemSelected,
			]}
		>
			<CustomText text={item.label} color={PRIMARY_COLOR} />
		</View>
	);

	return (
		<View style={styles.wrapper}>
			<MultiSelect
				placeholder="Select Trips"
				labelField="label"
				valueField="value"
				data={categoryList}
				value={trips}
				onChange={setTrips}
				renderItem={item}
				renderSelectedItem={selectedItem}
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
		width: NINETY_P,
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

export default TripSelector;
