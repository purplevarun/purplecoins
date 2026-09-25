import { createContext } from "react";

import type DatabaseContextValue from "@/types/DatabaseContextValue";

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export default DatabaseContext;
