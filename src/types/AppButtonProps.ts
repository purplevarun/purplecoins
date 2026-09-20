import type ButtonVariant from "@/types/ButtonVariant";
import type HeaderIconButtonProps from "@/types/HeaderIconButtonProps";
import { type ViewStyle } from "react-native";

type AppButtonProps = Readonly<{
	label: string;
	onPress: () => void;
	variant?: ButtonVariant;
	icon?: HeaderIconButtonProps["icon"];
	isDisabled?: boolean;
	isLoading?: boolean;
	isCompact?: boolean;
	style?: ViewStyle;
}>;

export type { AppButtonProps as default };
