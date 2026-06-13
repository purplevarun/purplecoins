import type { WebDatabase } from "@/db/database";

import {
	deleteSimpleEntityRow,
	getTripRow,
	getTripRows,
	upsertSimpleEntityRow,
} from "@/repositories/financeRepository";
import type { Trip } from "@/types/Trip";
import { AppError } from "@/utils/AppError";
import { createId } from "@/utils/id";

const getTrips = async (database: WebDatabase): Promise<readonly Trip[]> =>
	getTripRows(database);

const getTrip = async (
	database: WebDatabase,
	id: string,
): Promise<Trip | null> => getTripRow(database, id);

const saveTrip = async (
	database: WebDatabase,
	id: string | undefined,
	name: string,
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError("TRIP_NAME_REQUIRED", "Trip name is required.");
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

const deleteTrip = async (database: WebDatabase, id: string): Promise<void> => {
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

export { deleteTrip, getTrip, getTrips, saveTrip };
