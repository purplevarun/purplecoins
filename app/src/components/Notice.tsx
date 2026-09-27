import CustomText from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type NoticeProps from "@/types/NoticeProps";

const getToneColor = (tone: NoticeProps["tone"]): string => {
	if (tone === "danger") {
		return COLORS.danger;
	}
	if (tone === "warning") {
		return COLORS.warning;
	}
	return COLORS.blue;
};

const Notice = ({ message, tone = "info" }: NoticeProps): React.JSX.Element => {
	const color = getToneColor(tone);
	return (
		<View style={[styles.container, { borderColor: color }]}>
			<Ionicons
				color={color}
				name={tone === "danger" ? "alert-circle" : "information-circle"}
				size={20}
			/>
			<CustomText style={styles.message}>{message}</CustomText>
		</View>
	);
};

const { ALIGN, BORDER, FLEX, FONT_SIZE, LINE_HEIGHT, RADIUS, SPACING } =
	styleConstants;

const styles = StyleSheet.create({
	container: {
		borderWidth: BORDER.THIN,
		borderRadius: RADIUS.S14,
		padding: SPACING.S12,
		backgroundColor: COLORS.surfaceSoft,
		flexDirection: FLEX.ROW,
		gap: SPACING.S9,
		alignItems: ALIGN.START,
	},
	message: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S13,
		lineHeight: LINE_HEIGHT.S19,
		flex: FLEX.FILL,
	},
});

export default Notice;
