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
import Action from "../../constants/enums/Action";
import { formatMoney } from "../../util/HelperFunctions";
import ITrip from "./ITrip";
import useTrip from "./useTrip";

const TripRenderItem = ({ item }: { item: ITrip }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: ITrip }) => {
	const { handleDetail, fetchTransactionsForTrip } = useTrip(item.id);
	const total = fetchTransactionsForTrip().reduce(
		(total, { action, amount }) =>
			action === Action.DEBIT ? total - amount : total + amount,
		0,
	);
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
			onPress={handleDetail}
		>
			<CustomText text={item.name} />
			<CustomText text={formatMoney(Math.abs(total))} />
		</TouchableOpacity>
	);
};

export default TripRenderItem;
