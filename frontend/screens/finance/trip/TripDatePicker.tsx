import { useState } from "react";
import { DISABLED_COLOR, PRIMARY_COLOR } from "../../../config/colors.config";
import {
	DimensionValue,
	StyleSheet,
	TouchableOpacity,
	View
} from "react-native";
import { formatDate } from "../../../util/helpers/HelperFunctions";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	FLEX_ROW,
	MARGIN,
	NINETY_P,
	PADDING,
	SPACE_BETWEEN
} from "../../../config/constants.config";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import CustomText from "../../../components/CustomText";
import useTripStore from "./TipStore";

const TripDatePicker = () => {
	const {
		tripStartDate,
		setTripStartDate,
		tripEndDate,
		tripStartDateSet,
		setTripEndDate,
		setTripStartDateSet,
		setTripEndDateSet
	} = useTripStore();

	return (
		<View style={styles.wrapper}>
			<CustomDatePicker
				name={"Start Date"}
				date={tripStartDate}
				setDate={setTripStartDate}
				confirmer={setTripStartDateSet}
			/>
			{tripStartDateSet && <CustomDatePicker
				name={"End Date"}
				date={tripEndDate}
				setDate={setTripEndDate}
				confirmer={setTripEndDateSet}
			/>}
		</View>
	);
};

interface Props {
	date: Date;
	setDate: (val: Date) => void;
	name: string;
	confirmer: (val: boolean) => void;
	width?: DimensionValue;
}

const CustomDatePicker = ({ date, setDate, name, confirmer }: Props) => {
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
			style={{
				borderWidth: BORDER_WIDTH,
				borderColor: PRIMARY_COLOR,
				borderRadius: BORDER_RADIUS,
				width: "48%",
				alignSelf: CENTER,
				padding: PADDING,
				marginTop: MARGIN * 2
			}}
			onPress={() => {
				setShowPicker(true);
				setClicked(true);
			}}
		>
			{clicked ? (
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
		alignSelf: CENTER
	}
});

export default TripDatePicker;
