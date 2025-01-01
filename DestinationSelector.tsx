import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import IRenderItem from "./IRenderItem";
import useSourceService from "./SourceService";
import useTransactionStore from "./TransactionStore";
import TransactionType from "./TransactionType";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "./colors.config";
import { PADDING } from "./constants.config";
import dropdownStyle from "./dropdown.style";

const DestinationSelector = () => {
	const { sourceId, destinationId, setDestinationId, type } =
		useTransactionStore();
	const { fetchSources } = useSourceService();

	if (type !== TransactionType.TRANSFER) return null;

	const destinationDropdownData = fetchSources()
		.filter((destination) => destination.id !== sourceId)
		.map((source) => ({
			label: source.name,
			value: source.id,
		}));

	if (destinationDropdownData.length === 0)
		return (
			<View
				style={{
					paddingLeft: PADDING * 2,
					paddingVertical: PADDING,
				}}
			>
				<CustomText
					text={"No destinations available"}
					color={DISABLED_COLOR}
				/>
			</View>
		);

	const item = (item: IRenderItem) => {
		const backgroundColor =
			destinationId === item.value ? DISABLED_COLOR : BACKGROUND_COLOR;
		return (
			<View
				style={{
					backgroundColor,
					padding: PADDING,
				}}
			>
				<CustomText text={item.label} color={PRIMARY_COLOR} />
			</View>
		);
	};

	return (
		<View style={dropdownStyle.wrapper}>
			<Dropdown
				placeholder={"Select Destination"}
				labelField={"label"}
				valueField={"value"}
				data={destinationDropdownData}
				value={destinationId}
				onChange={(item) => setDestinationId(item.value)}
				renderItem={item}
				style={dropdownStyle.dropdown}
				placeholderStyle={dropdownStyle.placeholder}
				selectedTextStyle={dropdownStyle.selectedText}
				itemContainerStyle={dropdownStyle.itemContainer}
				containerStyle={dropdownStyle.container}
				itemTextStyle={dropdownStyle.itemText}
			/>
		</View>
	);
};

export default DestinationSelector;
