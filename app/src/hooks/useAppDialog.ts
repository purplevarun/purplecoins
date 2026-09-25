import { useContext } from "react";

import AppDialogContext from "@/providers/AppDialogContext";
import type AppDialogContextValue from "@/types/AppDialogContextValue";

const useAppDialog = (): AppDialogContextValue => {
	const context = useContext(AppDialogContext);
	if (!context) {
		throw new Error("useAppDialog must be used inside AppDialogProvider.");
	}
	return context;
};

export default useAppDialog;
