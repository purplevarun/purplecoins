import appConstants from "@/constants/appConstants";

import SCHEMA_MIGRATIONS from "@/database/migrations";
import SCHEMA_SQL from "@/database/schema";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const { DATABASE_NAME } = appConstants;

const initializeDatabase = async (): Promise<SQLiteDatabase> => {
	const database = await openDatabaseAsync(DATABASE_NAME);
	await database.execAsync(SCHEMA_SQL);
	// Safe column additions for existing installs (silently ignored if already present)
	for (const migration of SCHEMA_MIGRATIONS) {
		try {
			await database.execAsync(migration);
		} catch {
			// Column already exists — safe to ignore
		}
	}
	return database;
};

export default initializeDatabase;
