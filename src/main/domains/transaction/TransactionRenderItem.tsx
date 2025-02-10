import { TouchableOpacity, View } from "react-native";
import { transactionRoutes } from "../../app/router/Routes";
import CustomText from "../../components/CustomText";
import {
	BLUE_COLOR,
	GREEN_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
	YELLOW_COLOR,
} from "../../constants/colors.config";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../constants/constants.config";
import TransactionAction from "../../constants/enums/TransactionAction";
import TransactionType from "../../constants/enums/TransactionType";
import useScreen from "../../hooks/useScreen";
import Transaction from "../../models/Transaction";
import { convertDateToString, formatMoney } from "../../util/HelperFunctions";

const TransactionRenderItem = ({ item }: { item: Transaction }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: Transaction }) => {
	const navigate = useScreen();
	const borderColor =
		item.type === TransactionType.TRANSFER
			? BLUE_COLOR
			: item.type === TransactionType.INVESTMENT
				? YELLOW_COLOR
				: item.action === TransactionAction.DEBIT
					? RED_COLOR
					: GREEN_COLOR;
	return (
		<View style={{ margin: MARGIN, gap: MARGIN }}>
			<CustomText text={convertDateToString(item.date)} />
			<TouchableOpacity
				style={{
					borderColor,
					backgroundColor: SECONDARY_COLOR,
					borderRadius: BORDER_RADIUS,
					padding: PADDING,
					borderWidth: BORDER_WIDTH,
					flexDirection: FLEX_ROW,
					justifyContent: SPACE_BETWEEN,
				}}
				onPress={() =>
					navigate(transactionRoutes.detail, { id: item.id })
				}
			>
				<CustomText text={item.reason} />
				<CustomText text={formatMoney(item.amount)} />
			</TouchableOpacity>
		</View>
	);
};

export default TransactionRenderItem;
