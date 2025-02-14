import { TouchableOpacity } from "react-native";
import CustomText from "../../components/CustomText";
import {
	GREEN_COLOR,
	RED_COLOR,
	SECONDARY_COLOR,
} from "../../constants/colors.config";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../constants/constants.config";
import useDatabase from "../../hooks/useDatabase";
import useScreen from "../../hooks/useScreen";
import Relation from "../../models/Relation";
import { calculateTotal, formatMoney } from "../../util/HelperFunctions";
import RelationMap from "./RelationMap";

const RelationRenderItem = ({ item }: { item: Relation }) => {
	return <RelationRenderItemImplementation item={item} />;
};

export const RelationRenderItemImplementation = ({
	item,
	total,
}: {
	item: Relation;
	total?: number;
}) => {
	const { fetchTransactionsForRelation } = useDatabase();
	const navigate = useScreen();
	const transactions = fetchTransactionsForRelation(item.id);
	const calculatedTotal = total ?? calculateTotal(transactions);

	return (
		<TouchableOpacity
			style={{
				backgroundColor: SECONDARY_COLOR,
				borderRadius: BORDER_RADIUS,
				padding: PADDING,
				margin: MARGIN,
				borderWidth: calculatedTotal == 0 ? 0 : 2,
				borderColor: calculatedTotal < 0 ? RED_COLOR : GREEN_COLOR,
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
			}}
			onPress={() =>
				navigate(RelationMap[item.type].routes.detail, {
					id: item.id,
					transactions,
					total: calculatedTotal,
				})
			}
		>
			<CustomText text={item.name} />
			<CustomText text={formatMoney(Math.abs(calculatedTotal))} />
		</TouchableOpacity>
	);
};

export default RelationRenderItem;
