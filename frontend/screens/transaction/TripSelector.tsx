import { View } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "../../config/colors.config";
import { FONT_SIZE, PADDING } from "../../config/constants.config";
import { MultiSelect } from "react-native-element-dropdown";
import CustomText from "../../components/CustomText";
import dropdownStyle from "../../styles/dropdown.style";
import TransactionType from "../../components/TransactionType";
import IRenderItem from "../../interfaces/IRenderItem";
import useTransactionStore from "./TransactionStore";
import useTripService from "../trip/TripService";

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
