import { SECONDARY_COLOR } from "../../../config/colors.config";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
	BORDER_RADIUS, FLEX_ROW,
	MARGIN,
	PADDING,
	SEVENTY_P,
	SPACE_BETWEEN
} from "../../../config/constants.config";
import { ExpenseData } from "../../../components/TransactionType";
import CustomText from "../../../components/CustomText";
import ITransaction from "../../../interfaces/ITransaction";
import useTransactionService from "./TransactionService";

const TransactionRenderItem = ({ item }: { item: ITransaction }) => {
	const { selectTransaction } = useTransactionService();
	const border = { borderColor: ExpenseData[item.type].color };

	return (
		<TouchableOpacity
			style={[styles.outer, border]}
			onPress={() => selectTransaction(item.id)}
		>
			<CustomText text={item.reason} />
			<CustomText text={item.amount} />
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	outer: {
		backgroundColor: SECONDARY_COLOR,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		margin: MARGIN,
		borderWidth: 4,
		justifyContent: SPACE_BETWEEN,
		flexDirection: FLEX_ROW
	},
	reason: { width: SEVENTY_P }
});

export default TransactionRenderItem;
