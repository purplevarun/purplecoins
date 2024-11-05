import { StyleSheet, View } from "react-native";
import {
	CENTER,
	FLEX_ROW,
	NINETY_P,
	SPACE_BETWEEN,
} from "../../../config/constants.config";
import useTripStore from "./TripStore";
import CustomDatePicker from "../../../components/CustomDatePicker";

const TripDatePicker = () => {
	const {
		startDate,
		setStartDate,
		showStartDate,
		setShowStartDate,
		endDate,
		setEndDate,
		showEndDate,
		setShowEndDate,
		setStartDateSet,
		setEndDateSet,
	} = useTripStore();

	return (
		<View style={styles.wrapper}>
			<CustomDatePicker
				name={"Start Date"}
				date={startDate}
				setDate={setStartDate}
				showPicker={showStartDate}
				setShowPicker={setShowStartDate}
				confirmer={setStartDateSet}
			/>
			<CustomDatePicker
				name={"End Date"}
				date={endDate}
				setDate={setEndDate}
				showPicker={showEndDate}
				setShowPicker={setShowEndDate}
				confirmer={setEndDateSet}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
		width: NINETY_P,
		alignSelf: CENTER,
	},
});

export default TripDatePicker;
