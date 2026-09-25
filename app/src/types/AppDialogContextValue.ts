import type AppDialogConfirmOptions from "@/types/AppDialogConfirmOptions";
import type AppDialogMessageOptions from "@/types/AppDialogMessageOptions";

type AppDialogContextValue = Readonly<{
	confirm: (options: AppDialogConfirmOptions) => void;
	showMessage: (options: AppDialogMessageOptions) => void;
}>;

export type { AppDialogContextValue as default };
