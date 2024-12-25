import { useState } from "react";
import { TouchableOpacity } from "react-native";
import {
	BORDER_RADIUS,
	BORDER_WIDTH,
	CENTER,
	MARGIN,
	NINETY_P,
	PADDING,
} from "../../config/constants.config";
import { DISABLED_COLOR, PRIMARY_COLOR } from "../../config/colors.config";
import { formatDate } from "../../HelperFunctions";
import CustomText from "../../components/CustomText";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import useTransactionStore from "./TransactionStore";

const TransactionDatePicker = () => {
	const { date, setDate } = useTransactionStore();
	const [showPicker, setShowPicker] = useState(false);
	const [clicked, setClicked] = useState(false);
	if (showPicker)
		return (
			<RNDateTimePicker
				value={date}
				onChange={(_, newDate) => {
					setShowPicker(false);
					setDate(newDate ?? new Date());
					setClicked(true);
				}}
			/>
		);
	return (
		<TouchableOpacity
			style={{
				borderWidth: BORDER_WIDTH,
				borderColor: PRIMARY_COLOR,
				borderRadius: BORDER_RADIUS,
				width: NINETY_P,
				alignSelf: CENTER,
				padding: PADDING,
				marginTop: MARGIN * 2,
			}}
			onPress={() => setShowPicker(true)}
		>
			<CustomText
				text={formatDate(date)}
				color={clicked ? PRIMARY_COLOR : DISABLED_COLOR}
			/>
		</TouchableOpacity>
	);
};

export default TransactionDatePicker;
