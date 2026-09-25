import type AppDialogConfirmOptions from "@/types/AppDialogConfirmOptions";
import type AppDialogMessageOptions from "@/types/AppDialogMessageOptions";

type ActiveDialog =
	| Readonly<{
			mode: "CONFIRM";
			options: AppDialogConfirmOptions;
	  }>
	| Readonly<{
			mode: "MESSAGE";
			options: AppDialogMessageOptions;
	  }>;

export type { ActiveDialog as default };
