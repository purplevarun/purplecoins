import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type FloatingAddButtonProps from "@/types/FloatingAddButtonProps";

const {
	ALIGN,
	BORDER,
	FLEX,
	OVERFLOW,
	POSITION,
	RADIUS,
	SCALE,
	SHADOW,
	SIZES,
	SPACING,
} = styleConstants;

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
		position: POSITION.ABSOLUTE,
		right: SPACING.S20,
		bottom: SPACING.S24,
		width: SIZES.S64,
		height: SIZES.S64,
		borderRadius: RADIUS.S24,
		overflow: OVERFLOW.HIDDEN,
		borderWidth: BORDER.THIN,
		borderColor: COLORS.primaryBright,
		elevation: SHADOW.ELEVATION_HIGH,
		shadowColor: COLORS.primary,
		shadowOpacity: SHADOW.OPACITY_STRONG,
		shadowRadius: SHADOW.RADIUS_MD,
		shadowOffset: { width: SHADOW.OFFSET_X, height: SHADOW.OFFSET_Y_MD },
	},
	gradient: {
		flex: FLEX.FILL,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
	},
	plus: {
		width: PLUS_BAR_LENGTH,
		height: PLUS_BAR_LENGTH,
	},
	plusBar: {
		position: POSITION.ABSOLUTE,
		borderRadius: RADIUS.PILL,
		backgroundColor: COLORS.background,
	},
	plusBarHorizontal: {
		top: PLUS_BAR_OFFSET,
		left: SPACING.S0,
		width: PLUS_BAR_LENGTH,
		height: PLUS_BAR_THICKNESS,
	},
	plusBarVertical: {
		left: PLUS_BAR_OFFSET,
		top: SPACING.S0,
		width: PLUS_BAR_THICKNESS,
		height: PLUS_BAR_LENGTH,
	},
	pressed: {
		transform: [{ scale: SCALE.FIRM }],
	},
});

export default FloatingAddButton;
