import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import CustomText from "./CustomText";
import HideSelector from "./HideSelector";
import IRenderItem from "./IRenderItem";
import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "./colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FONT_SIZE,
	NINETY_P,
	PADDING,
	PADDING_TOP_ADD_SCREEN,
} from "./constants.config";
import useInvestment from "./src/main/domains/investment/useInvestment";

interface Props {
	investment: string | null;
	setInvestment: (val: string) => void;
}

const InvestmentSelector = ({ investment, setInvestment }: Props) => {
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
		<View style={styles.wrapper}>
			<Dropdown
				placeholder={"Select Investment"}
				labelField={"label"}
				valueField={"value"}
				data={investmentModels}
				value={investment}
				onChange={(item) => setInvestment(item.value)}
				renderItem={item}
				style={styles.dropdown}
				placeholderStyle={styles.placeholder}
				selectedTextStyle={styles.selectedText}
				itemContainerStyle={styles.itemContainer}
				containerStyle={styles.container}
				itemTextStyle={styles.itemText}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		paddingTop: PADDING_TOP_ADD_SCREEN,
	},
	dropdown: {
		alignSelf: CENTER,
		width: NINETY_P,
		height: FONT_SIZE * 2.5,
		borderWidth: 2,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		borderColor: PRIMARY_COLOR,
		backgroundColor: BACKGROUND_COLOR,
	},
	container: {
		backgroundColor: BACKGROUND_COLOR,
		borderWidth: 1,
		borderTopRightRadius: 3,
		borderTopLeftRadius: 3,
	},
	itemText: {
		color: PRIMARY_COLOR,
	},
	itemContainer: {
		backgroundColor: BACKGROUND_COLOR,
	},
	selectedText: {
		fontSize: FONT_SIZE,
		color: PRIMARY_COLOR,
	},
	placeholder: {
		fontSize: FONT_SIZE,
		color: DISABLED_COLOR,
	},
});

export default InvestmentSelector;
