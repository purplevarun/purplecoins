import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import { DATABASE_NAME, SCHEMA_VERSION } from "@/constants/appConstants";

import { SCHEMA_SQL } from "@/database/schema";

const initializeDatabase = async (): Promise<SQLiteDatabase> => {
	const database = await openDatabaseAsync(DATABASE_NAME);
	await database.execAsync(SCHEMA_SQL);
	await database.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
	return database;
};

export { initializeDatabase };
