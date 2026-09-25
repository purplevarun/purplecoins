import type HomeMode from "@/types/HomeMode";
import type { Ionicons } from "@expo/vector-icons";
import { type ComponentProps } from "react";

type HomeModeOption = Readonly<{
	mode: HomeMode;
	label: string;
	icon: ComponentProps<typeof Ionicons>["name"];
}>;

export type { HomeModeOption as default };
