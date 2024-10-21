import {
	GREEN_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
} from "../../../config/colors.config";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../../config/constants.config";
import CustomText from "../../../components/CustomText";
import TransactionModel from "../../../models/TransactionModel";
import ExpenseType from "../../../types/ExpenseType";

const TransactionRenderItem = ({ item }: { item: TransactionModel }) => {
	const color = item.type === ExpenseType.EXPENSE ? RED_COLOR : GREEN_COLOR;
	return (
		<TouchableOpacity style={styles.button}>
			<Animated.View style={styles.view}>
				<CustomText text={item.reason} />
				<CustomText text={item.amount} color={color} />
			</Animated.View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: SECONDARY_COLOR,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		margin: MARGIN,
	},
	view: {
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
	},
});

export default TransactionRenderItem;
