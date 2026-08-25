import type ButtonVariant from "@/types/ButtonVariant";
import { type ViewStyle } from "react-native";

type AppButtonProps = Readonly<{
	label: string;
	onPress: () => void;
	variant?: ButtonVariant;
	icon?: IconName;
	isDisabled?: boolean;
	isLoading?: boolean;
	isCompact?: boolean;
	style?: ViewStyle;
}>;

export type { AppButtonProps as default };
