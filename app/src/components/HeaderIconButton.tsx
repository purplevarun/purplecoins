import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type HeaderIconButtonProps from "@/types/HeaderIconButtonProps";

const { ALIGN, BORDER, RADIUS, SCALE, SIZES } = styleConstants;

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
		width: SIZES.S40,
		height: SIZES.S40,
		borderRadius: RADIUS.S14,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.border,
		backgroundColor: COLORS.surfaceRaised,
	},
	active: {
		borderColor: COLORS.borderStrong,
		backgroundColor: COLORS.primaryMuted,
	},
	pressed: {
		transform: [{ scale: SCALE.LIGHT }],
	},
});

export default HeaderIconButton;
