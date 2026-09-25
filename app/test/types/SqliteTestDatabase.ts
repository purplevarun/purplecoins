import type { SQLiteDatabase } from "expo-sqlite";
import type { DatabaseSync } from "node:sqlite";

type SqliteTestDatabase = Readonly<{
	sqlite: DatabaseSync;
	database: SQLiteDatabase;
}>;

export type { SqliteTestDatabase as default };
