import {
	BACKGROUND_COLOR,
	DISABLED_COLOR,
	PRIMARY_COLOR
} from "../../../config/colors.config";
import { StyleSheet, View } from "react-native";
import {
	BORDER_RADIUS,
	CENTER,
	FONT_SIZE,
	NINETY_P,
	PADDING,
	PADDING_TOP_ADD_SCREEN
} from "../../../config/constants.config";
import { Dropdown } from "react-native-element-dropdown";
import TransactionType from "../../../types/TransactionType";
import RenderItem from "../../../types/RenderItem";
import CustomText from "../../../components/CustomText";
import useDatabase from "../../../util/database/DatabaseFunctions";
import useTransactionStore from "./TransactionStore";

const InvestmentSelector = () => {
	const { transactionInvestmentId, setTransactionInvestmentId, transactionType } = useTransactionStore();
	const { getInvestments } = useDatabase();
	const investmentModels = getInvestments().map((investment) => ({
		label: investment.name,
		value: investment.id
	}));

	if (transactionType !== TransactionType.INVESTMENT) return null;

	const item = (item: RenderItem) => {
		const backgroundColor =
			transactionInvestmentId === item.value ? DISABLED_COLOR : BACKGROUND_COLOR;
		return (
			<View
				style={{
					backgroundColor,
					padding: PADDING
				}}
			>
				<CustomText text={item.label} color={PRIMARY_COLOR} />
			</View>
		);
	};

	return (
		<View style={styles.wrapper}>
			<Dropdown
				placeholder={"Select Investment *"}
				labelField={"label"}
				valueField={"value"}
				data={investmentModels}
				value={transactionInvestmentId}
				onChange={(item) => setTransactionInvestmentId(item.value)}
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
		paddingTop: PADDING_TOP_ADD_SCREEN
	},
	dropdown: {
		alignSelf: CENTER,
		width: NINETY_P,
		height: FONT_SIZE * 2.5,
		borderWidth: 2,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		borderColor: PRIMARY_COLOR,
		backgroundColor: BACKGROUND_COLOR
	},
	container: {
		backgroundColor: BACKGROUND_COLOR,
		borderWidth: 1,
		borderTopRightRadius: 3,
		borderTopLeftRadius: 3
	},
	itemText: {
		color: PRIMARY_COLOR
	},
	itemContainer: {
		backgroundColor: BACKGROUND_COLOR
	},
	selectedText: {
		fontSize: FONT_SIZE,
		color: PRIMARY_COLOR
	},
	placeholder: {
		fontSize: FONT_SIZE,
		color: DISABLED_COLOR
	}
});

export default InvestmentSelector;
