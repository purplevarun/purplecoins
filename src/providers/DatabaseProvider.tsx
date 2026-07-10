import type { SQLiteDatabase } from "expo-sqlite";
import { useState, type PropsWithChildren, type ReactNode } from "react";

import DatabaseContext from "@/providers/DatabaseContext";
import type DatabaseContextValue from "@/types/DatabaseContextValue";

type DatabaseProviderProps = PropsWithChildren<
	Readonly<{
		database: SQLiteDatabase;
	}>
>;

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
