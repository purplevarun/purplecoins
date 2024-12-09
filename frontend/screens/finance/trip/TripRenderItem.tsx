import { FC } from "react";
import { formatDate } from "../../../util/helpers/HelperFunctions";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BORDER_RADIUS, FLEX_ROW, MARGIN, PADDING, SPACE_BETWEEN } from "../../../config/constants.config";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import CustomText from "../../../components/CustomText";
import ITrip from "../../../interfaces/ITrip";
import useTripService from "./TripService";

const TripRenderItem: Props = ({ item }) => {
	const { selectTrip } = useTripService();
	return (
		<TouchableOpacity
			style={styles.button}
			onPress={() => selectTrip(item.id)}
		>
			<CustomText text={item.name} />
			<View>
				<CustomText
					text={formatDate(item.startDate)}
					alignSelf={"flex-end"}
				/>
				<CustomText
					text={formatDate(item.endDate)}
					alignSelf={"flex-end"}
				/>
			</View>
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
		backgroundColor: SECONDARY_COLOR
	}
});
export default TripRenderItem;