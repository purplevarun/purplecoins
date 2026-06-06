import type { SQLiteDatabase } from "expo-sqlite";

type DatabaseState = Readonly<{
	database: SQLiteDatabase | null;
	error: string | null;
}>;

export type { DatabaseState };
