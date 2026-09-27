import CustomText from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type EmptyStateProps from "@/types/EmptyStateProps";

const EmptyState = ({
	icon,
	title,
	message,
}: EmptyStateProps): React.JSX.Element => (
	<View style={styles.container}>
		<View style={styles.icon}>
			<Ionicons color={COLORS.primaryBright} name={icon} size={30} />
		</View>
		<CustomText style={styles.title}>{title}</CustomText>
		<CustomText style={styles.message}>{message}</CustomText>
	</View>
);

const {
	ALIGN,
	BORDER,
	FONT_SIZE,
	FONT_WEIGHT,
	LINE_HEIGHT,
	RADIUS,
	SIZES,
	SPACING,
} = styleConstants;

const styles = StyleSheet.create({
	container: {
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
		padding: SPACING.S40,
		gap: SPACING.S10,
	},
	icon: {
		width: SIZES.S64,
		height: SIZES.S64,
		borderRadius: RADIUS.S22,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
		backgroundColor: COLORS.primaryMuted,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.borderStrong,
	},
	title: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S18,
		fontWeight: FONT_WEIGHT.HEAVY,
		textAlign: ALIGN.CENTER,
	},
	message: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S14,
		textAlign: ALIGN.CENTER,
		lineHeight: LINE_HEIGHT.S20,
	},
});

export default EmptyState;
