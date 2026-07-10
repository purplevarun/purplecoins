import AppError from "@/errors/AppError";
import financeRepository from "@/repositories/financeRepository";
import type Trip from "@/types/Trip";
import createId from "@/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	deleteSimpleEntityRow,
	getArchivedTripRows,
	getTripRow,
	getTripRows,
	setSimpleEntityArchivedRow,
	simpleEntityNameExistsRow,
	upsertSimpleEntityRow,
} = financeRepository;

const mapTrip = (trip: Trip): Trip => ({
	...trip,
	archived: Boolean(trip.archived),
});

const getTrips = async (database: SQLiteDatabase): Promise<readonly Trip[]> =>
	(await getTripRows(database)).map(mapTrip);

const getArchivedTrips = async (
	database: SQLiteDatabase,
): Promise<readonly Trip[]> =>
	(await getArchivedTripRows(database)).map(mapTrip);

const getTrip = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Trip | null> => {
	const trip = await getTripRow(database, id);
	return trip ? mapTrip(trip) : null;
};

const saveTrip = async (
	database: SQLiteDatabase,
	id: string | undefined,
	name: string,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError("TRIP_NAME_REQUIRED", "Trip name is required.");
	}
	if (
		await simpleEntityNameExistsRow(database, "trips", normalizedName, id)
	) {
		throw new AppError(
			"TRIP_NAME_DUPLICATE",
			`A trip named "${normalizedName}" already exists.`,
		);
	}
	const now = Date.now();
	const existingTrip = id ? await getTripRow(database, id) : null;
	const tripId = id ?? createId();
	await upsertSimpleEntityRow(database, "trips", {
		id: tripId,
		name: normalizedName,
		createdAt: existingTrip?.createdAt ?? now,
		updatedAt: now,
	});
	return tripId;
};

const setTripArchived = async (
	database: SQLiteDatabase,
	id: string,
	archived: boolean,
): Promise<void> =>
	setSimpleEntityArchivedRow(database, "trips", id, archived, Date.now());

const deleteTrip = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	try {
		await deleteSimpleEntityRow(database, "trips", id);
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes("FOREIGN KEY")) {
			throw new AppError(
				"TRIP_IN_USE",
				"Trips linked to transactions cannot be deleted.",
			);
		}
		throw error;
	}
};

const tripService = {
	deleteTrip,
	getArchivedTrips,
	getTrip,
	getTrips,
	saveTrip,
	setTripArchived,
};

export default tripService;
