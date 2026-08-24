import { BlurView } from "expo-blur";
import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";

type GlassCardProps = PropsWithChildren<
	Readonly<{
		accent?: "default" | "success" | "danger" | "warning";
	}>
>;

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
		overflow: "hidden",
		borderWidth: 1,
		borderRadius: 20,
		backgroundColor: COLORS.glass,
		shadowColor: COLORS.black,
		shadowOpacity: 0.24,
		shadowRadius: 20,
		shadowOffset: { width: 0, height: 8 },
		elevation: 4,
	},
	blur: {
		backgroundColor: COLORS.glass,
	},
	content: {
		padding: 16,
	},
});

export default GlassCard;
