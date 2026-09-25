import appConstants from "@/constants/appConstants";

import SCHEMA_MIGRATIONS from "@/database/migrations";
import SCHEMA_SQL from "@/database/schema";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const { DATABASE_NAME } = appConstants;

const initializeDatabase = async (): Promise<SQLiteDatabase> => {
	const database = await openDatabaseAsync(DATABASE_NAME);
	try {
		await database.execAsync(SCHEMA_SQL);

		for (const migration of SCHEMA_MIGRATIONS) {
			try {
				await database.execAsync(migration);
			} catch (error) {
				if (
					!(error instanceof Error) ||
					!error.message.includes("duplicate column name")
				) {
					throw error;
				}
			}
		}
		return database;
	} catch (error) {
		await database.closeAsync();
		throw error;
	}
};

export default initializeDatabase;
