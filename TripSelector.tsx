import { View } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import IRenderItem from "./IRenderItem";
import useTransactionStore from "./TransactionStore";
import TransactionType from "./TransactionType";
import useTripService from "./TripService";
import { DISABLED_COLOR, PRIMARY_COLOR } from "./colors.config";
import { FONT_SIZE, PADDING } from "./constants.config";
import dropdownStyle from "./dropdown.style";

const TripSelector = () => {
	const { type, tripIds, setTripIds } = useTransactionStore();
	const { fetchTrips } = useTripService();
	const tripList = fetchTrips().map(({ id, name }) => ({
		label: name,
		value: id,
	}));

	if (
		type === TransactionType.TRANSFER ||
		type === TransactionType.INVESTMENT
	)
		return null;

	if (tripList.length === 0)
		return (
			<View
				style={{
					paddingLeft: PADDING * 2,
					paddingVertical: PADDING,
				}}
			>
				<CustomText
					text={"No trips available"}
					color={DISABLED_COLOR}
				/>
			</View>
		);

	const selectedItem = (item: IRenderItem) => (
		<View style={dropdownStyle.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	const item = (item: IRenderItem) => (
		<View
			style={[
				dropdownStyle.renderItem,
				tripIds.includes(item.value) &&
					dropdownStyle.renderItemSelected,
			]}
		>
			<CustomText text={item.label} color={PRIMARY_COLOR} />
		</View>
	);

	return (
		<View style={dropdownStyle.wrapper}>
			<MultiSelect
				placeholder={"Select Trips"}
				labelField={"label"}
				valueField={"value"}
				data={tripList}
				value={tripIds}
				onChange={setTripIds}
				renderItem={item}
				renderSelectedItem={selectedItem}
				style={dropdownStyle.dropdown}
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
