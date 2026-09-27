import { BlurView } from "expo-blur";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type GlassCardProps from "@/types/GlassCardProps";

const { BORDER, OVERFLOW, RADIUS, SHADOW, SPACING } = styleConstants;

const getAccentColor = (accent: GlassCardProps["accent"]): string => {
	if (accent === "success") {
		return COLORS.success;
	}
	if (accent === "danger") {
		return COLORS.danger;
	}
	if (accent === "warning") {
		return COLORS.warning;
	}
	return COLORS.border;
};

const GlassCard = ({
	children,
	accent = "default",
}: GlassCardProps): ReactNode => (
	<View style={[styles.wrapper, { borderColor: getAccentColor(accent) }]}>
		<BlurView intensity={32} tint="dark" style={styles.blur}>
			<View style={styles.content}>{children}</View>
		</BlurView>
	</View>
);

const styles = StyleSheet.create({
	wrapper: {
		overflow: OVERFLOW.HIDDEN,
		borderWidth: BORDER.THICK,
		borderRadius: RADIUS.S20,
		backgroundColor: COLORS.glass,
		shadowColor: COLORS.black,
		shadowOpacity: SHADOW.OPACITY_SOFT,
		shadowRadius: SHADOW.RADIUS_LG,
		shadowOffset: { width: SHADOW.OFFSET_X, height: SHADOW.OFFSET_Y_SM },
		elevation: SHADOW.ELEVATION_LOW,
	},
	blur: {
		backgroundColor: COLORS.glass,
	},
	content: {
		padding: SPACING.S16,
	},
});

export default GlassCard;
