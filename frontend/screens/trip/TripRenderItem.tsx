import { FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../config/constants.config";
import { SECONDARY_COLOR } from "../../config/colors.config";
import CustomText from "../../components/CustomText";
import useTripService from "./TripService";
import ITrip from "../../interfaces/ITrip";
import Routes from "../../Routes";
import { useNavigation } from "@react-navigation/native";

const TripRenderItem: Props = ({ item }) => {
	const { fetchTotalForCurrentTrip } = useTripService();
	const { navigate } = useNavigation<any>();
	const total = fetchTotalForCurrentTrip(item.id);

	return (
		<TouchableOpacity
			style={styles.button}
			onPress={() => navigate(Routes.Trip.Detail, { tripId: item.id })}
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
