import CustomText from "@/components/CustomText";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";

type LoadingScreenProps = Readonly<{
	error?: string | null;
}>;

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

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.background,
		padding: 24,
		gap: 16,
	},
	title: {
		color: COLORS.text,
		fontSize: 20,
		fontWeight: "800",
		textAlign: "center",
	},
	error: {
		color: COLORS.danger,
		fontSize: 14,
		textAlign: "center",
	},
	label: {
		color: COLORS.textMuted,
		fontSize: 14,
	},
});

export default LoadingScreen;
