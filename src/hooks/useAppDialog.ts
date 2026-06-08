import { useContext } from "react";

import { AppDialogContext } from "@/providers/AppDialogProvider";
import type { AppDialogContextValue } from "@/types/AppDialogContextValue";

const useAppDialog = (): AppDialogContextValue => {
	const context = useContext(AppDialogContext);
	if (!context) {
		throw new Error("useAppDialog must be used inside AppDialogProvider.");
	}
	return context;
};

export { useAppDialog };
