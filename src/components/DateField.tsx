import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";
import { formatDate } from "@/utils/date";

type DateFieldProps = Readonly<{
	label: string;
	value: number;
	onChange: (value: number) => void;
}>;

const DateField = ({
	label,
	value,
	onChange,
}: DateFieldProps): React.JSX.Element => {
	const [isPickerVisible, setIsPickerVisible] = useState(false);

	return (
		<View style={styles.container}>
			<Text style={styles.label}>{label}</Text>
			<Pressable
				onPress={() => setIsPickerVisible(true)}
				style={styles.trigger}
			>
				<Text style={styles.value}>{formatDate(value)}</Text>
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
					onChange={(_event, selectedDate) => {
						setIsPickerVisible(Platform.OS === "ios");
						if (selectedDate) {
							onChange(selectedDate.getTime());
						}
					}}
					value={new Date(value)}
				/>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 7,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 12,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	trigger: {
		minHeight: 50,
		borderWidth: 1,
		borderColor: COLORS.border,
		borderRadius: 15,
		backgroundColor: "rgba(255,255,255,0.045)",
		paddingHorizontal: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	value: {
		color: COLORS.text,
		fontSize: 15,
	},
});

export { DateField };
