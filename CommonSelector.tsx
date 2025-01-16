import { DimensionValue, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import IRenderItem from "./IRenderItem";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "./colors.config";
import { PADDING } from "./constants.config";
import dropdownStyle from "./dropdown.style";

const CommonSelector = ({
	name,
	data,
	value,
	setValue,
	width,
}: {
	name: string;
	data: IRenderItem[];
	value: string | null;
	setValue: (value: string) => void;
	width: DimensionValue;
}) => {
	const item = (item: IRenderItem) => {
		const backgroundColor =
			value === item.value ? DISABLED_COLOR : BACKGROUND_COLOR;
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
				placeholder={name}
				labelField={"label"}
				valueField={"value"}
				data={data}
				value={value}
				onChange={(item) => setValue(item.value)}
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

export default CommonSelector;
