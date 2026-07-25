import tripService from "@/services/tripService";

import { beforeEach, describe, expect, it } from "vitest";

import financeRepository from "@/repositories/financeRepository";
import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	deleteTrip,
	getArchivedTrips,
	getTrip,
	getTrips,
	saveTrip,
	setTripArchived,
} = tripService;
const { insertCategory, insertSource, insertTrip } = dbFixtures;
const { createTransactionRow } = financeRepository;

const NOW = 1_780_000_000_000;

describe("tripService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	it("creates a trip and coerces archived to a boolean", async () => {
		const id = await saveTrip(database, undefined, "Goa");

		const trip = await getTrip(database, id);
		expect(trip?.name).toBe("Goa");
		expect(trip?.archived).toBe(false);
	});

	it("throws TRIP_NAME_REQUIRED for a blank name", async () => {
		await expect(
			saveTrip(database, undefined, "   "),
		).rejects.toMatchObject({ code: "TRIP_NAME_REQUIRED" });
	});

	it("throws TRIP_NAME_DUPLICATE case-insensitively", async () => {
		await saveTrip(database, undefined, "Goa");

		await expect(
			saveTrip(database, undefined, "goa"),
		).rejects.toMatchObject({ code: "TRIP_NAME_DUPLICATE" });
	});

	it("updates an existing trip's name while preserving createdAt", async () => {
		const existing = await insertTrip(database, {
			name: "Old",
			createdAt: 1000,
		});

		await saveTrip(database, existing.id, "New");

		const updated = await getTrip(database, existing.id);
		expect(updated?.name).toBe("New");
		expect(updated?.createdAt).toBe(1000);
	});

	it("separates active from archived trips", async () => {
		const active = await insertTrip(database, { name: "Active" });
		const archived = await insertTrip(database, { name: "Archived" });
		await setTripArchived(database, archived.id, true);

		expect((await getTrips(database)).map((row) => row.id)).toEqual([
			active.id,
		]);
		expect((await getArchivedTrips(database)).map((row) => row.id)).toEqual(
			[archived.id],
		);
	});

	it("deletes an unused trip", async () => {
		const trip = await insertTrip(database);
		await deleteTrip(database, trip.id);
		expect(await getTrip(database, trip.id)).toBeNull();
	});

	it("maps a foreign-key violation to TRIP_IN_USE", async () => {
		const source = await insertSource(database);
		const category = await insertCategory(database);
		const trip = await insertTrip(database);
		await createTransactionRow(
			database,
			{
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: source.id,
				categoryId: category.id,
				tripId: trip.id,
				amount: "10",
				reason: "x",
				transactionAt: NOW,
			},
			"txn-1",
			NOW,
		);

		await expect(deleteTrip(database, trip.id)).rejects.toMatchObject({
			code: "TRIP_IN_USE",
		});
	});

	it("rethrows an unrelated database error unchanged (not misclassified as TRIP_IN_USE)", async () => {
		const trip = await insertTrip(database);
		await database.closeAsync();

		const rejection = await deleteTrip(database, trip.id).then(
			() => null,
			(error: unknown) => error,
		);

		expect(rejection).not.toMatchObject({ code: "TRIP_IN_USE" });
		expect((rejection as Error).message).not.toContain("FOREIGN KEY");
	});
});
