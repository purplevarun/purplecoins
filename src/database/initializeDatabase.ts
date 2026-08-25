import appConstants from "@/constants/appConstants";

import SCHEMA_SQL from "@/database/schema";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const { DATABASE_NAME } = appConstants;
const MIGRATION_SCRIPTS: readonly string[] = [
	"ALTER TABLE cards ADD COLUMN card_type TEXT NOT NULL DEFAULT 'CREDIT_CARD';",
	"ALTER TABLE sources ADD COLUMN archived INTEGER;",
	"ALTER TABLE categories ADD COLUMN archived INTEGER;",
	"ALTER TABLE trips ADD COLUMN archived INTEGER;",
	"ALTER TABLE investments ADD COLUMN archived INTEGER;",
];

const initializeDatabase = async (): Promise<SQLiteDatabase> => {
	const database = await openDatabaseAsync(DATABASE_NAME);

	await database.execAsync(SCHEMA_SQL);

	for (const script of MIGRATION_SCRIPTS) {
		try {
			await database.execAsync(script);
		} catch {
			// Existing installs may already have these columns.
		}
	}

	return database;
};

export default initializeDatabase;
