import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type EmptyStateProps = Readonly<{
	icon: ComponentProps<typeof Ionicons>["name"];
	title: string;
	message: string;
}>;

export type { EmptyStateProps as default };
