import { DimensionValue, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import HideSelector from "./HideSelector";
import IRenderItem from "./IRenderItem";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "./colors.config";
import { PADDING } from "./constants.config";
import dropdownStyle from "./dropdown.style";
import useSource from "./src/main/domains/source/useSource";

interface Props {
	source: string;
	setSource: (val: string) => void;
	width: DimensionValue;
}

const SourceSelector = ({ source, setSource, width }: Props) => {
	const { sourceModels } = useSource();

	if (sourceModels.length === 0) return <HideSelector />;

	const item = (item: IRenderItem) => {
		const backgroundColor =
			source === item.value ? DISABLED_COLOR : BACKGROUND_COLOR;
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
		<View style={[dropdownStyle.wrapper, { width }]}>
			<Dropdown
				placeholder={"Source"}
				labelField={"label"}
				valueField={"value"}
				data={sourceModels}
				value={source}
				onChange={(item) => setSource(item.value)}
				renderItem={item}
				style={dropdownStyle.dropdown}
				placeholderStyle={dropdownStyle.placeholder}
				selectedTextStyle={dropdownStyle.selectedText}
				itemContainerStyle={dropdownStyle.itemContainer}
				containerStyle={dropdownStyle.container}
				itemTextStyle={dropdownStyle.itemText}
				renderRightIcon={() => null}
			/>
		</View>
	);
};

export default SourceSelector;
