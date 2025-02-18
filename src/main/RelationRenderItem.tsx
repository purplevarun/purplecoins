import { TouchableOpacity } from "react-native";
import CustomText from "./CustomText";
import { formatMoney } from "./HelperFunctions";
import Relation from "./Relation";
import RelationMap from "./RelationMap";
import { GREEN_COLOR, RED_COLOR, SECONDARY_COLOR } from "./colors.config";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";
import useDatabase from "./useDatabase";
import useScreen from "./useScreen";

const RelationRenderItem = ({ item }: { item: Relation }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: Relation }) => {
	const { fetchTransactionsForRelation } = useDatabase();
	const navigate = useScreen();
	const transactions = fetchTransactionsForRelation(item.id);
	const currentRelation = RelationMap[item.type];
	return (
		<TouchableOpacity
			style={{
				backgroundColor: SECONDARY_COLOR,
				borderRadius: BORDER_RADIUS,
				padding: PADDING,
				margin: MARGIN,
				borderWidth: item.total == 0 ? 0 : 2,
				borderColor: item.total! < 0 ? RED_COLOR : GREEN_COLOR,
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
			}}
			onPress={() =>
				navigate(currentRelation.routes.detail, {
					id: item.id,
					transactions,
					total: item.total,
				})
			}
		>
			<CustomText text={item.name} />
			<CustomText text={formatMoney(Math.abs(item.total!))} />
		</TouchableOpacity>
	);
};

export default RelationRenderItem;
