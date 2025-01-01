import { useNavigation } from "@react-navigation/native";
import { FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import CustomText from "./CustomText";
import ITrip from "./ITrip";
import useTripService from "./TripService";
import { SECONDARY_COLOR } from "./colors.config";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";

const TripRenderItem: Props = ({ item }) => {
	const { fetchTotalForCurrentTrip } = useTripService();
	const { navigate } = useNavigation<any>();
	const total = fetchTotalForCurrentTrip(item.id);

	return (
		<TouchableOpacity
			style={styles.button}
			onPress={() => navigate("Trip.Detail", { tripId: item.id })}
		>
			<CustomText text={item.name} />
			<CustomText text={total} />
		</TouchableOpacity>
	);
};

type Props = FC<{ item: ITrip }>;

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
