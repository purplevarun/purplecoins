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
import useInvestment from "./src/main/domains/investment/useInvestment";

interface Props {
	investment: string | null;
	setInvestment: (val: string) => void;
	width: DimensionValue;
}

const InvestmentSelector = ({ investment, setInvestment, width }: Props) => {
	const { investmentModels } = useInvestment();

	if (investmentModels.length === 0) {
		return <HideSelector investment />;
	}

	const item = (item: IRenderItem) => {
		const backgroundColor =
			investment === item.value ? DISABLED_COLOR : BACKGROUND_COLOR;
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
				placeholder={"Investment"}
				labelField={"label"}
				valueField={"value"}
				data={investmentModels}
				value={investment}
				onChange={(item) => setInvestment(item.value)}
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

export default InvestmentSelector;
