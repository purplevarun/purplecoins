import { View } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "../../../config/colors.config";
import { FONT_SIZE, PADDING } from "../../../config/constants.config";
import { MultiSelect } from "react-native-element-dropdown";
import useDatabase from "../../../util/database/DatabaseFunctions";
import CustomText from "../../../components/CustomText";
import dropdownStyle from "../../../styles/dropdown.style";
import TransactionType from "../../../components/TransactionType";
import RenderItem from "../../../interfaces/RenderItem";
import useTransactionStore from "./TransactionStore";

const TripSelector = () => {
	const { transactionType, transactionTripIds, setTransactionTripIds } = useTransactionStore();
	const { getTrips } = useDatabase();
	const tripList = getTrips().map(({ id, name }) => ({
		label: name,
		value: id
	}));

	if (transactionType === TransactionType.TRANSFER || transactionType === TransactionType.INVESTMENT)
		return null;

	if (tripList.length === 0)
		return (
			<View
				style={{
					paddingLeft: PADDING * 2,
					paddingVertical: PADDING
				}}
			>
				<CustomText
					text={"No trips available"}
					color={DISABLED_COLOR}
				/>
			</View>
		);


	const selectedItem = (item: RenderItem) => (
		<View style={dropdownStyle.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	const item = (item: RenderItem) => (
		<View
			style={[
				dropdownStyle.renderItem,
				transactionTripIds.includes(item.value) && dropdownStyle.renderItemSelected
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
				value={transactionTripIds}
				onChange={setTransactionTripIds}
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
