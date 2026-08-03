import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet } from "react-native";

import COLORS from "@/constants/colors";

type FloatingAddButtonProps = Readonly<{
	onPress: () => void;
	accessibilityLabel?: string;
	icon?: ComponentProps<typeof Ionicons>["name"];
	bottomOffset?: number;
	tone?: "primary" | "secondary";
}>;

const FloatingAddButton = ({
	onPress,
	accessibilityLabel = "Add",
	icon = "add",
	bottomOffset = 24,
	tone = "primary",
}: FloatingAddButtonProps): React.JSX.Element => (
	<Pressable
		accessibilityLabel={accessibilityLabel}
		onPress={onPress}
		style={({ pressed }) => [
			styles.button,
			tone === "secondary" ? styles.secondaryButton : null,
			{ bottom: bottomOffset },
			pressed && styles.pressed,
		]}
	>
		<Ionicons
			color={tone === "secondary" ? COLORS.text : COLORS.background}
			name={icon}
			size={30}
		/>
	</Pressable>
);

const styles = StyleSheet.create({
	button: {
		position: "absolute",
		right: 20,
		bottom: 24,
		width: 60,
		height: 60,
		borderRadius: 22,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.primary,
		borderWidth: 1,
		borderColor: COLORS.primaryBright,
		elevation: 8,
		shadowColor: COLORS.primary,
		shadowOpacity: 0.35,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 8 },
	},
	pressed: {
		transform: [{ scale: 0.95 }],
	},
	secondaryButton: {
		backgroundColor: COLORS.backgroundElevated,
		borderColor: COLORS.blue,
		shadowColor: COLORS.blue,
	},
});

export default FloatingAddButton;
