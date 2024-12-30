import { formatMoney } from "./HelperFunctions";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	FONT_SIZE,
	MARGIN,
	PADDING,
	SEVENTY_P,
	SPACE_BETWEEN,
} from "./constants.config";
import { ExpenseData } from "./TransactionType";
import CustomText from "./CustomText";
import ITransaction from "./ITransaction";
import Routes from "./Routes";
import { useNavigation } from "@react-navigation/native";

const TransactionRenderItem = ({ item }: { item: ITransaction }) => {
	const { color: borderColor } = ExpenseData[item.type];
	const { navigate } = useNavigation<any>();
	return (
		<TouchableOpacity
			style={[styles.outer, { borderColor }]}
			onPress={() =>
				navigate(Routes.Transaction.Detail, { transactionId: item.id })
			}
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
		flexDirection: FLEX_ROW,
	},
	reason: { width: SEVENTY_P },
});

export default TransactionRenderItem;
