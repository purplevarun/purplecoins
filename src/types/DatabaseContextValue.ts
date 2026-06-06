import type { SQLiteDatabase } from "expo-sqlite";

type DatabaseContextValue = Readonly<{
	database: SQLiteDatabase;
	dataVersion: number;
	refreshData: () => void;
}>;

export type { DatabaseContextValue };
