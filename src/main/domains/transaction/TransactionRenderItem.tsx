import { StyleSheet, TouchableOpacity } from "react-native";
import { formatMoney } from "../../../../HelperFunctions";
import CustomText from "../../components/CustomText";
import {
	BLUE_COLOR,
	GREEN_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
} from "../../constants/colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SEVENTY_P,
	SPACE_BETWEEN,
} from "../../constants/constants.config";
import Action from "../../constants/enums/Action";
import Type from "../../constants/enums/Type";
import ITransaction from "./ITransaction";
import useTransaction from "./useTransaction";

const TransactionRenderItem = ({ item }: { item: ITransaction }) => {
	const { handleDetail } = useTransaction(item.id);
	const color =
		item.type === Type.TRANSFER
			? BLUE_COLOR
			: item.action === Action.DEBIT
				? RED_COLOR
				: GREEN_COLOR;
	return (
		<TouchableOpacity style={[styles.outer]} onPress={handleDetail}>
			<CustomText text={item.reason} alignSelf={CENTER} />
			<CustomText
				text={formatMoney(item.amount)}
				alignSelf={CENTER}
				color={color}
			/>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	outer: {
		backgroundColor: SECONDARY_COLOR,
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		margin: MARGIN,
		justifyContent: SPACE_BETWEEN,
		flexDirection: FLEX_ROW,
	},
	reason: { width: SEVENTY_P },
});

export default TransactionRenderItem;
