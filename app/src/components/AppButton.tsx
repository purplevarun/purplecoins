import CustomText from "@/components/CustomText";
import type ButtonColors from "@/types/ButtonColors";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type AppButtonProps from "@/types/AppButtonProps";

const getButtonColors = (variant: AppButtonProps["variant"]): ButtonColors => {
	if (variant === "danger") {
		return {
			backgroundColor: COLORS.dangerMuted,
			color: COLORS.danger,
			borderColor: COLORS.dangerBorder,
		};
	}
	if (variant === "success") {
		return {
			backgroundColor: COLORS.successMuted,
			color: COLORS.success,
			borderColor: COLORS.successBorder,
		};
	}
	if (variant === "secondary") {
		return {
			backgroundColor: COLORS.surfaceMid,
			color: COLORS.text,
			borderColor: COLORS.border,
		};
	}
	return {
		backgroundColor: COLORS.primary,
		color: COLORS.background,
		borderColor: COLORS.primaryBright,
	};
};

const AppButton = ({
	label,
	onPress,
	variant = "primary",
	icon,
	isDisabled = false,
	isLoading = false,
	isCompact = false,
	style,
}: AppButtonProps): React.JSX.Element => {
	const colors = getButtonColors(variant);
	const isUnavailable = isDisabled || isLoading;
	const buttonStyle = [
		styles.button,
		isCompact && styles.compact,
		{
			backgroundColor: colors.backgroundColor,
			borderColor: colors.borderColor,
			opacity: isUnavailable ? OPACITY.MEDIUM : OPACITY.FULL,
		},
		style,
	];

	return (
		<Pressable
			accessibilityRole="button"
			disabled={isUnavailable}
			onPress={onPress}
			style={({ pressed }) => [
				buttonStyle,
				pressed && !isUnavailable && styles.pressed,
			]}
		>
			{isLoading ? (
				<ActivityIndicator color={colors.color} size="small" />
			) : (
				<>
					{icon ? (
						<Ionicons color={colors.color} name={icon} size={18} />
					) : null}
					<CustomText style={[styles.label, { color: colors.color }]}>
						{label}
					</CustomText>
				</>
			)}
		</Pressable>
	);
};

const {
	ALIGN,
	BORDER,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	LETTER_SPACING,
	OPACITY,
	RADIUS,
	SCALE,
	SIZES,
	SPACING,
} = styleConstants;

const styles = StyleSheet.create({
	button: {
		minHeight: SIZES.S50,
		paddingHorizontal: SPACING.S18,
		borderRadius: RADIUS.S15,
		borderWidth: BORDER.THIN,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
		flexDirection: FLEX.ROW,
		gap: SPACING.S8,
	},
	compact: {
		minHeight: SIZES.S38,
		paddingHorizontal: SPACING.S12,
		borderRadius: RADIUS.S12,
	},
	pressed: {
		transform: [{ scale: SCALE.GENTLE }],
	},
	label: {
		fontSize: FONT_SIZE.S14,
		fontWeight: FONT_WEIGHT.HEAVY,
		letterSpacing: LETTER_SPACING.RELAXED,
	},
});

export default AppButton;
