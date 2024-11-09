import { View } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "../config/colors.config";
import { CENTER, FONT_SIZE } from "../config/constants.config";
import { useQuery } from "@realm/react";
import { MultiSelect } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import ExpenseType from "../types/ExpenseType";
import useTransactionStore from "../screens/finance/transaction/TransactionStore";
import RenderItemType from "../types/RenderItemType";
import TripModel from "../models/TripModel";
import dropdownStyle from "../styles/dropdown.style";

const TripSelector = () => {
	const { type, trips, setTrips } = useTransactionStore();

	const tripList = useQuery(TripModel).map(({ id, name }) => ({
		label: name,
		value: id,
	}));

	if (tripList.length === 0)
		return (
			<View style={dropdownStyle.wrapper}>
				<CustomText
					text={"No trips available"}
					color={DISABLED_COLOR}
					alignSelf={CENTER}
				/>
			</View>
		);

	if (type === ExpenseType.TRANSFER || type === ExpenseType.INVESTMENT)
		return null;

	const selectedItem = (item: RenderItemType) => (
		<View style={dropdownStyle.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	const item = (item: RenderItemType) => (
		<View
			style={[
				dropdownStyle.renderItem,
				trips.includes(item.value) && dropdownStyle.renderItemSelected,
			]}
		>
			<CustomText text={item.label} color={PRIMARY_COLOR} />
		</View>
	);

	return (
		<View style={dropdownStyle.wrapper}>
			<MultiSelect
				placeholder="Select Trips"
				labelField="label"
				valueField="value"
				data={tripList}
				value={trips}
				onChange={setTrips}
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

export default TripSelector;
