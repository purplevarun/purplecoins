import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps } from "react";

type HomeTile = Readonly<{
	label: string;
	subtitle: string;
	icon: ComponentProps<typeof Ionicons>["name"];
	color: string;
	handlePress: () => void;
}>;

export type { HomeTile as default };
