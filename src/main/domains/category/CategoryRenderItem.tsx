import { TouchableOpacity } from "react-native";
import { categoryRoutes } from "../../app/router/Routes";
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

const CategoryRenderItem = ({ item }: { item: Relation }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item: { id, name } }: { item: Relation }) => {
	const { fetchTransactionsForRelation } = useDatabase();
	const navigate = useScreen();
	const transactions = fetchTransactionsForRelation(id);
	const total = calculateTotal(transactions);

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
				navigate(categoryRoutes.detail, {
					id,
					transactions,
					total,
				})
			}
		>
			<CustomText text={name} />
			<CustomText text={formatMoney(Math.abs(total))} />
		</TouchableOpacity>
	);
};

export default CategoryRenderItem;
