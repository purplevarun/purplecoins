import { useState } from "react";
import { DISABLED_COLOR, PRIMARY_COLOR } from "./colors.config";
import {
	DimensionValue,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import { formatDate } from "./HelperFunctions";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	FLEX_ROW,
	FORTY_EIGHT_P,
	NINETY_P,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import CustomText from "./CustomText";
import useTripStore from "./TripStore";

const TripDatePicker = () => {
	const {
		startDate,
		setStartDate,
		endDate,
		startDateSet,
		setEndDate,
		setStartDateSet,
		setEndDateSet,
		endDateSet,
	} = useTripStore();

	return (
		<View style={styles.wrapper}>
			<CustomDatePicker
				name={"Start Date"}
				date={startDate}
				setDate={setStartDate}
				confirmer={setStartDateSet}
				isSet={startDateSet}
			/>
			{startDateSet && (
				<CustomDatePicker
					name={"End Date"}
					date={endDate}
					setDate={setEndDate}
					confirmer={setEndDateSet}
					isSet={endDateSet}
				/>
			)}
		</View>
	);
};

const CustomDatePicker = ({
	date,
	setDate,
	name,
	confirmer,
	isSet,
}: {
	date: Date;
	setDate: (val: Date) => void;
	name: string;
	confirmer: (val: boolean) => void;
	width?: DimensionValue;
	isSet: boolean;
}) => {
	const [showPicker, setShowPicker] = useState(false);
	const [clicked, setClicked] = useState(false);
	if (showPicker)
		return (
			<RNDateTimePicker
				value={date}
				onChange={(_, newDate) => {
					setShowPicker(false);
					setDate(newDate ?? new Date());
					confirmer(true);
				}}
			/>
		);
	return (
		<TouchableOpacity
			style={styles.button}
			onPress={() => {
				setShowPicker(true);
				setClicked(true);
			}}
		>
			{clicked || isSet ? (
				<CustomText text={formatDate(date)} />
			) : (
				<CustomText text={name} color={DISABLED_COLOR} />
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flexDirection: FLEX_ROW,
		justifyContent: SPACE_BETWEEN,
		width: NINETY_P,
		alignSelf: CENTER,
	},
	button: {
		borderWidth: BORDER_WIDTH,
		borderColor: PRIMARY_COLOR,
		borderRadius: BORDER_RADIUS,
		width: FORTY_EIGHT_P,
		alignSelf: CENTER,
		padding: PADDING,
		marginTop: PADDING,
	},
});

export default TripDatePicker;
