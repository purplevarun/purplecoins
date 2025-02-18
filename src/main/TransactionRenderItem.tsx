import { TouchableOpacity, View } from "react-native";
import CustomText from "./CustomText";
import { convertDateToString, formatMoney } from "./HelperFunctions";
import { transactionRoutes } from "./Routes";
import Transaction from "./Transaction";
import TransactionAction from "./TransactionAction";
import TransactionType from "./TransactionType";
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
import useDatabase from "./useDatabase";
import useScreen from "./useScreen";
import useValues from "./useValues";

const TransactionRenderItem = ({ item }: { item: Transaction }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: Transaction }) => {
	const navigate = useScreen();
	const { fetchRelationsForTransaction } = useDatabase();
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
					values.setAmount(item.amount.toString());
					values.setReason(item.reason);
					values.setAction(item.action);
					values.setType(item.type);
					values.setDate(convertDateToString(item.date));
					const relations = fetchRelationsForTransaction(item.id);
					values.setSource(relations.TRANSACTION_SOURCE[0].id);
					if (relations.TRANSACTION_DESTINATION)
						values.setDestination(
							relations.TRANSACTION_DESTINATION[0].id,
						);
					if (relations.TRANSACTION_INVESTMENT)
						values.setInvestment(
							relations.TRANSACTION_INVESTMENT[0].id,
						);
					if (relations.TRANSACTION_TRIP)
						values.setTrips(
							relations.TRANSACTION_TRIP.map((trip) => trip.id),
						);
					if (relations.TRANSACTION_CATEGORY)
						values.setCategories(
							relations.TRANSACTION_CATEGORY.map(
								(trip) => trip.id,
							),
						);
					navigate(transactionRoutes.add);
				}}
			>
				<View style={{ width: "60%", flexWrap: "wrap" }}>
					<CustomText text={item.reason} />
				</View>
				<CustomText text={formatMoney(item.amount)} />
			</TouchableOpacity>
		</View>
	);
};

export default TransactionRenderItem;
