import CustomText from "@/components/CustomText";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type LoadingScreenProps from "@/types/LoadingScreenProps";

const LoadingScreen = ({ error }: LoadingScreenProps): React.JSX.Element => (
	<View style={styles.container}>
		{error ? (
			<>
				<CustomText style={styles.title}>
					Unable to open Purplecoins
				</CustomText>
				<CustomText style={styles.error}>{error}</CustomText>
			</>
		) : (
			<>
				<ActivityIndicator color={COLORS.primary} size="large" />
				<CustomText style={styles.label}>
					Opening the vault...
				</CustomText>
			</>
		)}
	</View>
);

const { ALIGN, FLEX, FONT_SIZE, FONT_WEIGHT, SPACING } = styleConstants;

const styles = StyleSheet.create({
	container: {
		flex: FLEX.FILL,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
		backgroundColor: COLORS.background,
		padding: SPACING.S24,
		gap: SPACING.S16,
	},
	title: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S20,
		fontWeight: FONT_WEIGHT.HEAVY,
		textAlign: ALIGN.CENTER,
	},
	error: {
		color: COLORS.danger,
		fontSize: FONT_SIZE.S14,
		textAlign: ALIGN.CENTER,
	},
	label: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S14,
	},
});

export default LoadingScreen;
