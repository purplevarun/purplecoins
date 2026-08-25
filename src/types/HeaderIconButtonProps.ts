import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type HeaderIconButtonProps = Readonly<{
	icon: ComponentProps<typeof Ionicons>["name"];
	onPress: () => void;
	isActive?: boolean;
	accessibilityLabel: string;
}>;

export type { HeaderIconButtonProps as default };
