import { TouchableOpacity } from "react-native";
import CustomText from "./CustomText";
import {
	GREEN_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
} from "./colors.config";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";
import TransactionAction from "./TransactionAction";
import TransactionType from "./TransactionType";
import useDatabase from "./useDatabase";
import useScreen from "./useScreen";
import Relation from "./Relation";
import { formatMoney } from "./HelperFunctions";
import RelationMap from "./RelationMap";

const RelationRenderItem = ({ item }: { item: Relation }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: Relation }) => {
	const { fetchTransactionsForRelation, fetchRelationsForTransaction } =
		useDatabase();
	const navigate = useScreen();
	const transactions = fetchTransactionsForRelation(item.id);
	const calculateTotal = () => {
		let sum = 0;
		transactions.forEach((transaction) => {
			if (transaction.type === TransactionType.TRANSFER) {
				const relations = fetchRelationsForTransaction(transaction.id);
				const destination = relations.TRANSACTION_DESTINATION[0];
				if (item.id === destination.id) {
					sum += transaction.amount;
				} else {
					sum -= transaction.amount;
				}
			} else if (transaction.action === TransactionAction.CREDIT) {
				sum += transaction.amount;
			} else {
				sum -= transaction.amount;
			}
		});
		return sum;
	};
	const total = calculateTotal();
	const currentRelation = RelationMap[item.type];
	return (
		<TouchableOpacity
			style={{
				backgroundColor: SECONDARY_COLOR,
				borderRadius: BORDER_RADIUS,
				padding: PADDING,
				margin: MARGIN,
				borderWidth: total == 0 ? 0 : 2,
				borderColor: total < 0 ? RED_COLOR : GREEN_COLOR,
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
			}}
			onPress={() =>
				navigate(currentRelation.routes.detail, {
					id: item.id,
					transactions,
					total,
				})
			}
		>
			<CustomText text={item.name} />
			<CustomText text={formatMoney(Math.abs(total))} />
		</TouchableOpacity>
	);
};

export default RelationRenderItem;
