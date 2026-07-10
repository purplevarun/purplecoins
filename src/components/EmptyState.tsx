import CustomText from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";

type EmptyStateProps = Readonly<{
	icon: ComponentProps<typeof Ionicons>["name"];
	title: string;
	message: string;
}>;

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

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		padding: 40,
		gap: 10,
	},
	icon: {
		width: 64,
		height: 64,
		borderRadius: 22,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.primaryMuted,
		borderWidth: 1,
		borderColor: COLORS.borderStrong,
	},
	title: {
		color: COLORS.text,
		fontSize: 18,
		fontWeight: "800",
		textAlign: "center",
	},
	message: {
		color: COLORS.textMuted,
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
	},
});

export default EmptyState;
