import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";
import type FloatingAddButtonProps from "@/types/FloatingAddButtonProps";

const PLUS_BAR_LENGTH = 24;
const PLUS_BAR_THICKNESS = 4.5;
const PLUS_BAR_OFFSET = (PLUS_BAR_LENGTH - PLUS_BAR_THICKNESS) / 2;

const FloatingAddButton = ({
	onPress,
}: FloatingAddButtonProps): React.JSX.Element => (
	<Pressable
		accessibilityLabel="Add"
		onPress={onPress}
		style={({ pressed }) => [styles.button, pressed && styles.pressed]}
	>
		<LinearGradient
			colors={[COLORS.primaryBright, COLORS.primary]}
			end={{ x: 1, y: 1 }}
			start={{ x: 0, y: 0 }}
			style={styles.gradient}
		>
			<View style={styles.plus}>
				<View style={[styles.plusBar, styles.plusBarHorizontal]} />
				<View style={[styles.plusBar, styles.plusBarVertical]} />
			</View>
		</LinearGradient>
	</Pressable>
);

const styles = StyleSheet.create({
	button: {
		position: "absolute",
		right: 20,
		bottom: 24,
		width: 64,
		height: 64,
		borderRadius: 24,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: COLORS.primaryBright,
		elevation: 10,
		shadowColor: COLORS.primary,
		shadowOpacity: 0.5,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 10 },
	},
	gradient: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	plus: {
		width: PLUS_BAR_LENGTH,
		height: PLUS_BAR_LENGTH,
	},
	plusBar: {
		position: "absolute",
		borderRadius: 999,
		backgroundColor: COLORS.background,
	},
	plusBarHorizontal: {
		top: PLUS_BAR_OFFSET,
		left: 0,
		width: PLUS_BAR_LENGTH,
		height: PLUS_BAR_THICKNESS,
	},
	plusBarVertical: {
		left: PLUS_BAR_OFFSET,
		top: 0,
		width: PLUS_BAR_THICKNESS,
		height: PLUS_BAR_LENGTH,
	},
	pressed: {
		transform: [{ scale: 0.94 }],
	},
});

export default FloatingAddButton;
