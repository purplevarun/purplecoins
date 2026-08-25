import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteSimpleEntityRow: vi.fn(async () => {}),
	getArchivedTripRows: vi.fn(async () => []),
	getTripRow: vi.fn(async () => null),
	getTripRows: vi.fn(async () => []),
	setSimpleEntityArchivedRow: vi.fn(async () => {}),
	simpleEntityNameExistsRow: vi.fn(async () => false),
	upsertSimpleEntityRow: vi.fn(async () => {}),
	createId: vi.fn(() => "trip-id"),
}));

vi.mock("@/repositories/financeRepository", () => ({
	default: {
		deleteSimpleEntityRow: mocks.deleteSimpleEntityRow,
		getArchivedTripRows: mocks.getArchivedTripRows,
		getTripRow: mocks.getTripRow,
		getTripRows: mocks.getTripRows,
		setSimpleEntityArchivedRow: mocks.setSimpleEntityArchivedRow,
		simpleEntityNameExistsRow: mocks.simpleEntityNameExistsRow,
		upsertSimpleEntityRow: mocks.upsertSimpleEntityRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import tripService from "@/services/tripService";

const database = {} as any;

describe("tripService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("maps archived values in getters", async () => {
		mocks.getTripRows.mockResolvedValueOnce([{ id: "t1", name: "A", archived: 1 }]);
		mocks.getArchivedTripRows.mockResolvedValueOnce([{ id: "t2", name: "B", archived: 0 }]);
		mocks.getTripRow.mockResolvedValueOnce({ id: "t1", name: "A", archived: 1 });
		mocks.getTripRow.mockResolvedValueOnce(null);

		expect((await tripService.getTrips(database))[0]?.archived).toBe(true);
		expect((await tripService.getArchivedTrips(database))[0]?.archived).toBe(false);
		expect((await tripService.getTrip(database, "t1"))?.archived).toBe(true);
		expect(await tripService.getTrip(database, "missing")).toBeNull();
	});

	it("validates and saves trip", async () => {
		await expect(tripService.saveTrip(database, undefined, "   ")).rejects.toMatchObject<AppError>({
			code: "TRIP_NAME_REQUIRED",
		});

		mocks.simpleEntityNameExistsRow.mockResolvedValueOnce(true);
		await expect(tripService.saveTrip(database, undefined, "Trip A")).rejects.toMatchObject<AppError>({
			code: "TRIP_NAME_DUPLICATE",
		});

		mocks.simpleEntityNameExistsRow.mockResolvedValueOnce(false);
		const createdId = await tripService.saveTrip(database, undefined, "  Trip A  ");
		expect(createdId).toBe("trip-id");
		expect(mocks.upsertSimpleEntityRow).toHaveBeenCalledWith(
			database,
			"trips",
			expect.objectContaining({
				id: "trip-id",
				name: "Trip A",
				createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			}),
		);

		mocks.simpleEntityNameExistsRow.mockResolvedValueOnce(false);
		mocks.getTripRow.mockResolvedValueOnce({ id: "t1", name: "Old", createdAt: 99 });
		const updatedId = await tripService.saveTrip(database, "t1", "  New Trip  ");
		expect(updatedId).toBe("t1");
		expect(mocks.upsertSimpleEntityRow).toHaveBeenCalledWith(
			database,
			"trips",
			expect.objectContaining({ id: "t1", name: "New Trip", createdAt: 99 }),
		);
	});

	it("archives and deletes trip with fk error mapping", async () => {
		await tripService.setTripArchived(database, "t1", true);
		expect(mocks.setSimpleEntityArchivedRow).toHaveBeenCalledWith(
			database,
			"trips",
			"t1",
			true,
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);

		mocks.deleteSimpleEntityRow.mockRejectedValueOnce(new Error("FOREIGN KEY failed"));
		await expect(tripService.deleteTrip(database, "t1")).rejects.toMatchObject<AppError>({
			code: "TRIP_IN_USE",
		});

		mocks.deleteSimpleEntityRow.mockRejectedValueOnce(new Error("disk"));
		await expect(tripService.deleteTrip(database, "t1")).rejects.toThrow("disk");
	});
});
