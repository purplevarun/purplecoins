import { TouchableOpacity, View } from "react-native";
import { transactionRoutes } from "./Routes";
import CustomText from "./CustomText";
import {
	BLUE_COLOR,
	GREEN_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
	YELLOW_COLOR,
} from "./colors.config";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";
import TransactionAction from "./TransactionAction";
import TransactionType from "./TransactionType";
import useDatabase from "./useDatabase";
import useScreen from "./useScreen";
import useValues from "./useValues";
import Transaction from "./Transaction";
import { convertDateToString, formatMoney } from "./HelperFunctions";

const TransactionRenderItem = ({ item }: { item: Transaction }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: Transaction }) => {
	const navigate = useScreen();
	const { duplicateTransaction } = useDatabase();
	const values = useValues();
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
				onLongPress={() => {
					duplicateTransaction(item);
					values.changeTrigger();
				}}
			>
				<CustomText text={item.reason} />
				<CustomText text={formatMoney(item.amount)} />
			</TouchableOpacity>
		</View>
	);
};

export default TransactionRenderItem;
