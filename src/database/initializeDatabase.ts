import appConstants from "@/constants/appConstants";

import SCHEMA_MIGRATIONS from "@/database/migrations";
import SCHEMA_SQL from "@/database/schema";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const { DATABASE_NAME } = appConstants;

const initializeDatabase = async (): Promise<SQLiteDatabase> => {
	const database = await openDatabaseAsync(DATABASE_NAME);

	await database.execAsync(SCHEMA_SQL);

	// Existing installs already have the tables; ALTER TABLE fails harmlessly
	// once a column has been added, so every migration runs on every launch.
	for (const migration of SCHEMA_MIGRATIONS) {
		try {
			await database.execAsync(migration);
		} catch {
			// Already applied (e.g. duplicate column) — safe to ignore.
		}
	}

	return database;
};

export default initializeDatabase;
