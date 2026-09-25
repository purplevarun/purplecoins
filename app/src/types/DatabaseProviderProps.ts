import type { SQLiteDatabase } from "expo-sqlite";
import { type PropsWithChildren } from "react";

type DatabaseProviderProps = PropsWithChildren<
	Readonly<{
		database: SQLiteDatabase;
	}>
>;

export type { DatabaseProviderProps as default };
