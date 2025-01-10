import { View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import IRenderItem from "./IRenderItem";
import useTransactionStore from "./TransactionStore";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "./colors.config";
import { PADDING } from "./constants.config";
import dropdownStyle from "./dropdown.style";
import useSource from "./main/domains/source/useSource";

const SourceSelector = () => {
	const { sourceId, setSourceId } = useTransactionStore();
	const { fetchSources } = useSource();

	const sourceModels = fetchSources().map((s) => ({
		label: s.name,
		value: s.id,
	}));

	if (sourceModels.length === 0)
		return (
			<View
				style={{
					paddingLeft: PADDING * 2,
					paddingVertical: PADDING,
				}}
			>
				<CustomText
					text={"No sources available"}
					color={DISABLED_COLOR}
				/>
			</View>
		);

	const item = (item: IRenderItem) => {
		const backgroundColor =
			sourceId === item.value ? DISABLED_COLOR : BACKGROUND_COLOR;
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
				placeholder={"Select Source"}
				labelField={"label"}
				valueField={"value"}
				data={sourceModels}
				value={sourceId}
				onChange={(item) => setSourceId(item.value)}
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

export default SourceSelector;
