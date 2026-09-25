import AppError from "@/errors/AppError";
import tripTypeRepository from "@/repositories/tripTypeRepository";
import type TripType from "@/types/TripType";
import createId from "@/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";

const { getTripTypeRows, tripTypeInUseRow, deleteTripTypeRow } =
	tripTypeRepository;

const getTripTypes = async (
	database: SQLiteDatabase,
): Promise<readonly TripType[]> => getTripTypeRows(database);

const saveTripType = async (
	database: SQLiteDatabase,
	name: string,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError(
			"TRIP_TYPE_NAME_REQUIRED",
			"Trip type name is required.",
		);
	}
	// check duplicates
	const row = await database.getFirstAsync<Pick<TripType, "id">>(
		`SELECT id FROM trip_types WHERE lower(name) = lower(?) LIMIT 1;`,
		normalizedName,
	);
	if (row) {
		throw new AppError(
			"TRIP_TYPE_NAME_DUPLICATE",
			`A trip type named "${normalizedName}" already exists.`,
		);
	}
	const now = Date.now();
	const id = createId();
	await database.runAsync(
		`INSERT INTO trip_types (id, name, created_at, updated_at) VALUES (?, ?, ?, ?);`,
		id,
		normalizedName,
		now,
		now,
	);
	return id;
};

const deleteTripType = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	if (await tripTypeInUseRow(database, id)) {
		throw new AppError(
			"TRIP_TYPE_IN_USE",
			"Trip type is referenced by trips and cannot be deleted.",
		);
	}
	await deleteTripTypeRow(database, id);
};

const tripTypeService = { getTripTypes, saveTripType, deleteTripType };

export default tripTypeService;
