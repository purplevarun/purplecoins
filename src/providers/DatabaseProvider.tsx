import { useState, type ReactNode } from "react";

import DatabaseContext from "@/providers/DatabaseContext";
import type DatabaseContextValue from "@/types/DatabaseContextValue";
import type DatabaseProviderProps from "@/types/DatabaseProviderProps";

const DatabaseProvider = ({
	children,
	database,
}: DatabaseProviderProps): ReactNode => {
	const [dataVersion, setDataVersion] = useState(0);

	const refreshData = (): void => {
		setDataVersion((currentVersion) => currentVersion + 1);
	};

	const value: DatabaseContextValue = {
		database,
		dataVersion,
		refreshData,
	};

	return (
		<DatabaseContext.Provider value={value}>
			{children}
		</DatabaseContext.Provider>
	);
};

export default DatabaseProvider;
