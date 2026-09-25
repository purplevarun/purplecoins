import type HomeModeOption from "@/types/HomeModeOption";
import type HomeModeOptionState from "@/types/HomeModeOptionState";

type HomeModeMenuOption = HomeModeOption &
	Omit<HomeModeOptionState, "textColor">;

export type { HomeModeMenuOption as default };
