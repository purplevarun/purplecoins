import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps } from "react";

type RowActionIconProps = Readonly<{
	icon: ComponentProps<typeof Ionicons>["name"];
	accessibilityLabel: string;
	onPress: () => void;
	tone?: "default" | "success";
}>;

export type { RowActionIconProps as default };
