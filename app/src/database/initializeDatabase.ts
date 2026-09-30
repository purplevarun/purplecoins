import appConstants from "@/constants/appConstants";

import SCHEMA_MIGRATIONS, {
	isIdempotentMigrationError,
} from "@/database/migrations";
import SCHEMA_SQL from "@/database/schema";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const { DATABASE_NAME } = appConstants;

const initializeDatabase = async (): Promise<SQLiteDatabase> => {
	const database = await openDatabaseAsync(DATABASE_NAME, {
		useNewConnection: true,
	});
	try {
		await database.execAsync(SCHEMA_SQL);

		for (const migration of SCHEMA_MIGRATIONS) {
			try {
				await database.execAsync(migration);
			} catch (error) {
				if (!isIdempotentMigrationError(error)) {
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
