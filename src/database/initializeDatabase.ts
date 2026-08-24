import appConstants from "@/constants/appConstants";

import SCHEMA_SQL from "@/database/schema";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const { DATABASE_NAME, SCHEMA_VERSION } = appConstants;

const initializeDatabase = async (): Promise<SQLiteDatabase> => {
	const database = await openDatabaseAsync(DATABASE_NAME);
	await database.execAsync(SCHEMA_SQL);
	await database.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
	// Safe column additions for existing installs (silently ignored if already present)
	try {
		await database.execAsync(
			`ALTER TABLE cards ADD COLUMN card_type TEXT NOT NULL DEFAULT 'CREDIT_CARD';`,
		);
	} catch {
		// Column already exists — safe to ignore
	}
	try {
		await database.execAsync(
			`ALTER TABLE sources ADD COLUMN archived INTEGER;`,
		);
	} catch {
		// Column already exists — safe to ignore
	}
	try {
		await database.execAsync(
			`ALTER TABLE categories ADD COLUMN archived INTEGER;`,
		);
	} catch {
		// Column already exists — safe to ignore
	}
	try {
		await database.execAsync(
			`ALTER TABLE trips ADD COLUMN archived INTEGER;`,
		);
	} catch {
		// Column already exists — safe to ignore
	}
	try {
		await database.execAsync(
			`ALTER TABLE investments ADD COLUMN archived INTEGER;`,
		);
	} catch {
		// Column already exists — safe to ignore
	}
	return database;
};

export default initializeDatabase;
