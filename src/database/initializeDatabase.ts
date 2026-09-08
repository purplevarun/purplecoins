import appConstants from "@/constants/appConstants";

import SCHEMA_SQL from "@/database/schema";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const { DATABASE_NAME } = appConstants;

const initializeDatabase = async (): Promise<SQLiteDatabase> => {
	const database = await openDatabaseAsync(DATABASE_NAME);

	await database.execAsync(SCHEMA_SQL);

	return database;
};

export default initializeDatabase;
