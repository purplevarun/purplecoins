import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import COLORS from "@/constants/colors";
import type HeaderIconButtonProps from "@/types/HeaderIconButtonProps";

const HeaderIconButton = ({
	icon,
	onPress,
	isActive = false,
	accessibilityLabel,
}: HeaderIconButtonProps): React.JSX.Element => (
	<Pressable
		accessibilityLabel={accessibilityLabel}
		accessibilityRole="button"
		onPress={onPress}
		style={({ pressed }) => [
			styles.button,
			isActive && styles.active,
			pressed && styles.pressed,
		]}
	>
		<Ionicons
			color={isActive ? COLORS.primaryBright : COLORS.text}
			name={icon}
			size={21}
		/>
	</Pressable>
);

const styles = StyleSheet.create({
	button: {
		width: 40,
		height: 40,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: COLORS.border,
		backgroundColor: "rgba(255,255,255,0.055)",
	},
	active: {
		borderColor: COLORS.borderStrong,
		backgroundColor: COLORS.primaryMuted,
	},
	pressed: {
		transform: [{ scale: 0.96 }],
	},
});

export default HeaderIconButton;
