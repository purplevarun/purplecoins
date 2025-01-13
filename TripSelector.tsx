import { DimensionValue, View } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import HideSelector from "./HideSelector";
import IRenderItem from "./IRenderItem";
import { PRIMARY_COLOR } from "./colors.config";
import { FONT_SIZE } from "./constants.config";
import dropdownStyle from "./dropdown.style";
import useTrip from "./src/main/domains/trip/useTrip";

interface Props {
	trips: string[];
	setTrips: (val: string[]) => void;
	width: DimensionValue;
}

const TripSelector = ({ trips, setTrips, width }: Props) => {
	const { tripModels } = useTrip();

	if (tripModels.length === 0) {
		return <HideSelector trip />;
	}

	const selectedItem = (item: IRenderItem) => (
		<View style={dropdownStyle.renderSelected}>
			<CustomText text={item.label} fontSize={FONT_SIZE / 2} />
		</View>
	);

	const item = (item: IRenderItem) => (
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
		<View style={[dropdownStyle.wrapper, { width }]}>
			<MultiSelect
				placeholder={"Trip"}
				labelField={"label"}
				valueField={"value"}
				data={tripModels}
				value={trips}
				onChange={setTrips}
				renderItem={item}
				renderSelectedItem={selectedItem}
				style={dropdownStyle.dropdown}
				placeholderStyle={dropdownStyle.placeholder}
				selectedTextStyle={dropdownStyle.selectedText}
				itemContainerStyle={dropdownStyle.itemContainer}
				containerStyle={dropdownStyle.container}
				itemTextStyle={dropdownStyle.itemText}
				selectedStyle={dropdownStyle.selected}
				renderRightIcon={() => null}
			/>
		</View>
	);
};

export default TripSelector;
