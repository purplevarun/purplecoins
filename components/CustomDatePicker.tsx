import { useState } from "react";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { TouchableOpacity } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "../config/colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	MARGIN,
	PADDING,
} from "../config/constants.config";
import CustomText from "./CustomText";
import { formatDate } from "../util/HelperFunctions";

interface Props {
	date: Date;
	setDate: (val: Date) => void;
	showPicker: boolean;
	setShowPicker: (val: boolean) => void;
	name: string;
	confirmer: (val: boolean) => void;
}

const CustomDatePicker = ({
	date,
	setDate,
	showPicker,
	setShowPicker,
	name,
	confirmer,
}: Props) => {
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
				borderWidth: 2,
				borderColor: PRIMARY_COLOR,
				borderRadius: BORDER_RADIUS,
				width: "48%",
				alignSelf: CENTER,
				padding: PADDING,
				marginTop: MARGIN * 2,
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

export default CustomDatePicker;
