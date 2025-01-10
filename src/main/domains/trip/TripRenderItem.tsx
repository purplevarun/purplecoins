import { StyleSheet, TouchableOpacity } from "react-native";
import CustomText from "../../../../CustomText";
import { formatMoney } from "../../../../HelperFunctions";
import { SECONDARY_COLOR } from "../../../../colors.config";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../../../constants.config";
import ITrip from "./ITrip";
import useTrip from "./useTrip";

const TripRenderItem = ({ item }: { item: ITrip }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: ITrip }) => {
	const { handleDetail, fetchTotalForCurrentTrip } = useTrip(item.id);
	const total = fetchTotalForCurrentTrip();
	return (
		<TouchableOpacity style={styles.button} onPress={handleDetail}>
			<CustomText text={item.name} />
			<CustomText text={formatMoney(total)} />
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		borderRadius: BORDER_RADIUS,
		padding: PADDING,
		margin: MARGIN,
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
		backgroundColor: SECONDARY_COLOR,
	},
});
export default TripRenderItem;
