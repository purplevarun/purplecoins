import { createContext } from "react";

import type AppDialogContextValue from "@/types/AppDialogContextValue";

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export default AppDialogContext;
