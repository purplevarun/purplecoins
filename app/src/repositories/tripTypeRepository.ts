import type TripType from "@/types/TripType";
import type { SQLiteDatabase } from "expo-sqlite";

const getTripTypeRows = async (
	database: SQLiteDatabase,
): Promise<readonly TripType[]> =>
	database.getAllAsync<TripType>(
		`SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM trip_types ORDER BY lower(name) ASC;`,
	);

const deleteTripTypeRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	await database.runAsync(`DELETE FROM trip_types WHERE id = ?;`, id);
};

const tripTypeInUseRow = async (
	database: SQLiteDatabase,
	id: string,
): Promise<boolean> => {
	const row = await database.getFirstAsync<{ id: string }>(
		`SELECT id FROM trips WHERE trip_type_id = ? LIMIT 1;`,
		id,
	);
	return row !== null;
};

export default {
	getTripTypeRows,
	deleteTripTypeRow,
	tripTypeInUseRow,
};
