import { useContext } from "react";

import { AppError } from "@/errors/AppError";
import { DatabaseContext } from "@/providers/DatabaseProvider";
import type { DatabaseContextValue } from "@/types/DatabaseContextValue";

const useDatabaseContext = (): DatabaseContextValue => {
	const context = useContext(DatabaseContext);
	if (!context) {
		throw new AppError(
			"DATABASE_CONTEXT_MISSING",
			"Database context is unavailable.",
		);
	}
	return context;
};

export { useDatabaseContext };
