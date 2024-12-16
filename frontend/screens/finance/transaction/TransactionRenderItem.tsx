import { formatMoney } from "../../../util/helpers/HelperFunctions";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
	BORDER_RADIUS, CENTER,
	FLEX_ROW, FONT_SIZE,
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
	const { color: borderColor } = ExpenseData[item.type];
	return (
		<TouchableOpacity
			style={[styles.outer, { borderColor }]}
			onPress={() => selectTransaction(item.id)}
		>
			<CustomText text={item.reason} alignSelf={CENTER} />
			<CustomText text={formatMoney(item.amount)} alignSelf={CENTER} />
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	outer: {
		borderWidth: FONT_SIZE / 5,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		margin: MARGIN / 2,
		justifyContent: SPACE_BETWEEN,
		flexDirection: FLEX_ROW
	},
	reason: { width: SEVENTY_P }
});

export default TransactionRenderItem;
