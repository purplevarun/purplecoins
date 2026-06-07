import { CustomText } from "@/components/CustomText";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	type ViewStyle,
} from "react-native";

import { COLORS } from "@/constants/colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

type AppButtonProps = Readonly<{
	label: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "danger" | "success";
	icon?: IconName;
	isDisabled?: boolean;
	isLoading?: boolean;
	isCompact?: boolean;
	style?: ViewStyle;
}>;

const getButtonColors = (
	variant: AppButtonProps["variant"],
): Readonly<{
	backgroundColor: string;
	color: string;
	borderColor: string;
}> => {
	if (variant === "danger") {
		return {
			backgroundColor: COLORS.dangerMuted,
			color: COLORS.danger,
			borderColor: "rgba(255, 107, 134, 0.36)",
		};
	}
	if (variant === "success") {
		return {
			backgroundColor: COLORS.successMuted,
			color: COLORS.success,
			borderColor: "rgba(82, 214, 163, 0.36)",
		};
	}
	if (variant === "secondary") {
		return {
			backgroundColor: "rgba(255,255,255,0.05)",
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
			opacity: isUnavailable ? 0.45 : 1,
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

const styles = StyleSheet.create({
	button: {
		minHeight: 50,
		paddingHorizontal: 18,
		borderRadius: 15,
		borderWidth: 1,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 8,
	},
	compact: {
		minHeight: 38,
		paddingHorizontal: 12,
		borderRadius: 12,
	},
	pressed: {
		transform: [{ scale: 0.98 }],
	},
	label: {
		fontSize: 14,
		fontWeight: "800",
		letterSpacing: 0.2,
	},
});

export { AppButton };
