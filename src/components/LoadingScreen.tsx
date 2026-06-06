import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";

type LoadingScreenProps = Readonly<{
	error?: string | null;
}>;

const LoadingScreen = ({ error }: LoadingScreenProps): React.JSX.Element => (
	<View style={styles.container}>
		{error ? (
			<>
				<Text style={styles.title}>Unable to open Gringotts</Text>
				<Text style={styles.error}>{error}</Text>
			</>
		) : (
			<>
				<ActivityIndicator color={COLORS.primary} size="large" />
				<Text style={styles.label}>Opening the vault...</Text>
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

export { LoadingScreen };
