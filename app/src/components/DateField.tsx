import CustomText from "@/components/CustomText";

import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type DateFieldProps from "@/types/DateFieldProps";
import dateUtils from "@/utils/date";
const { formatDate } = dateUtils;

const DateField = ({
	label,
	value,
	onChange,
}: DateFieldProps): React.JSX.Element => {
	const [isPickerVisible, setIsPickerVisible] = useState(false);

	return (
		<View style={styles.container}>
			<CustomText style={styles.label}>{label}</CustomText>
			<Pressable
				onPress={() => setIsPickerVisible(true)}
				style={styles.trigger}
			>
				<CustomText style={styles.value}>
					{formatDate(value)}
				</CustomText>
				<Ionicons
					color={COLORS.textMuted}
					name="calendar-outline"
					size={19}
				/>
			</Pressable>
			{isPickerVisible ? (
				<DateTimePicker
					display={Platform.OS === "ios" ? "inline" : "default"}
					mode="date"
					onDismiss={() => setIsPickerVisible(false)}
					onValueChange={(_event, selectedDate) => {
						onChange(selectedDate.getTime());
						if (Platform.OS === "android") {
							setIsPickerVisible(false);
						}
					}}
					value={new Date(value)}
				/>
			) : null}
		</View>
	);
};

const {
	ALIGN,
	BORDER,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	LETTER_SPACING,
	RADIUS,
	SIZES,
	SPACING,
	TEXT_TRANSFORM,
} = styleConstants;

const styles = StyleSheet.create({
	container: {
		gap: SPACING.S7,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
		fontWeight: FONT_WEIGHT.BOLD,
		textTransform: TEXT_TRANSFORM.UPPERCASE,
		letterSpacing: LETTER_SPACING.WIDEST,
	},
	trigger: {
		minHeight: SIZES.S50,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		borderRadius: RADIUS.S15,
		backgroundColor: COLORS.surfaceLight,
		paddingHorizontal: SPACING.S14,
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.SPACE_BETWEEN,
	},
	value: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S15,
	},
});

export default DateField;
