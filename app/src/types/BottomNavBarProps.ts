import type HomeMode from "@/types/HomeMode";
import type HomeModeOption from "@/types/HomeModeOption";

type BottomNavBarProps = Readonly<{
	options: readonly HomeModeOption[];
	activeMode: HomeMode;
	onSelectMode: (mode: HomeMode) => void;
}>;

export type { BottomNavBarProps as default };
