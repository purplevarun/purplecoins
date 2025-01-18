import { TouchableOpacity, View } from "react-native";
import CustomText from "../../components/CustomText";
import {
	BLUE_COLOR,
	GREEN_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
} from "../../constants/colors.config";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	FLEX_ROW,
	FLEX_START,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../constants/constants.config";
import Action from "../../constants/enums/Action";
import Type from "../../constants/enums/Type";
import { formatMoney } from "../../util/HelperFunctions";
import ITransaction from "./ITransaction";
import useTransaction from "./useTransaction";

const TransactionRenderItem = ({ item }: { item: ITransaction }) => {
	const { handleDetail } = useTransaction(item.id);
	const borderColor =
		item.type === Type.TRANSFER
			? BLUE_COLOR
			: item.action === Action.DEBIT
				? RED_COLOR
				: GREEN_COLOR;
	return (
		<TouchableOpacity
			style={{
				backgroundColor: SECONDARY_COLOR,
				borderWidth: BORDER_WIDTH,
				borderColor,
				borderRadius: BORDER_RADIUS,
				padding: PADDING,
				margin: MARGIN,
				justifyContent: SPACE_BETWEEN,
				flexDirection: FLEX_ROW,
			}}
			onPress={handleDetail}
		>
			<View
				style={{
					width: "70%",
					alignSelf: FLEX_START,
					flexDirection: FLEX_ROW,
				}}
			>
				<CustomText text={item.reason} alignSelf={CENTER} />
			</View>
			<CustomText text={formatMoney(item.amount)} alignSelf={CENTER} />
		</TouchableOpacity>
	);
};

export default TransactionRenderItem;
