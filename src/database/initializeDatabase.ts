import appConstants from "@/constants/appConstants";

import migrateDatabase from "@/database/migrations";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const { DATABASE_NAME } = appConstants;

const initializeDatabase = async (): Promise<SQLiteDatabase> => {
	const database = await openDatabaseAsync(DATABASE_NAME);
	try {
		await migrateDatabase(database);
		return database;
	} catch (error) {
		await database.closeAsync();
		throw error;
	}
};

export default initializeDatabase;
