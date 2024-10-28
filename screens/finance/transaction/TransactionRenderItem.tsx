import {
	BLUE_COLOR,
	GREEN_COLOR,
	PRIMARY_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
} from "../../../config/colors.config";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ONE,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../../config/constants.config";
import CustomText from "../../../components/CustomText";
import TransactionModel from "../../../models/TransactionModel";
import ExpenseType from "../../../types/ExpenseType";

const TransactionRenderItem = ({ item }: { item: TransactionModel }) => {
	const color =
		item.type === ExpenseType.EXPENSE
			? RED_COLOR
			: item.type === ExpenseType.INCOME
				? GREEN_COLOR
				: BLUE_COLOR;
	return (
		<TouchableOpacity style={styles.outer}>
			<View style={styles.reason}>
				<CustomText text={item.reason} />
			</View>
			<View style={[styles.amount, { backgroundColor: color }]}>
				<CustomText
					text={item.amount}
					color={PRIMARY_COLOR}
					alignSelf={CENTER}
				/>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	outer: {
		backgroundColor: SECONDARY_COLOR,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		margin: MARGIN,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
	},
	reason: { width: "70%" },
	amount: {
		flex: FLEX_ONE,
		justifyContent: CENTER,
		alignItems: CENTER,
		alignContent: CENTER,
		alignSelf: CENTER,
		padding: PADDING / 2,
		borderRadius: BORDER_RADIUS,
	},
});

export default TransactionRenderItem;
