import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getSettingRow: vi.fn(async () => null),
	upsertSettingRow: vi.fn(async () => {}),
}));

vi.mock("@/repositories/settingsRepository", () => ({
	default: {
		getSettingRow: mocks.getSettingRow,
		upsertSettingRow: mocks.upsertSettingRow,
	},
}));

import settingsService from "@/services/settingsService";

const database = {} as any;

describe("settingsService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		mocks.getSettingRow.mockClear();
		mocks.upsertSettingRow.mockClear();
	});

	it("returns native currency default true and parses stored values", async () => {
		mocks.getSettingRow.mockResolvedValueOnce(null);
		expect(await settingsService.getNativeCurrencyDisplay(database)).toBe(
			true,
		);

		mocks.getSettingRow.mockResolvedValueOnce("true");
		expect(await settingsService.getNativeCurrencyDisplay(database)).toBe(
			true,
		);

		mocks.getSettingRow.mockResolvedValueOnce("false");
		expect(await settingsService.getNativeCurrencyDisplay(database)).toBe(
			false,
		);
	});

	it("updates native currency display", async () => {
		await settingsService.updateNativeCurrencyDisplay(database, false);
		expect(mocks.upsertSettingRow).toHaveBeenCalledWith(
			database,
			"native_currency_display",
			"false",
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);
	});

	it("returns fy month default and parses values", async () => {
		mocks.getSettingRow.mockResolvedValueOnce(null);
		expect(await settingsService.getFyStartMonth(database)).toBe(4);

		mocks.getSettingRow.mockResolvedValueOnce("7");
		expect(await settingsService.getFyStartMonth(database)).toBe(7);

		mocks.getSettingRow.mockResolvedValueOnce("abc");
		expect(await settingsService.getFyStartMonth(database)).toBe(4);
	});

	it("updates fy month", async () => {
		await settingsService.updateFyStartMonth(database, 9);
		expect(mocks.upsertSettingRow).toHaveBeenCalledWith(
			database,
			"fy_start_month",
			"9",
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);
	});

	it("gets and updates default trip id", async () => {
		mocks.getSettingRow.mockResolvedValueOnce(null);
		expect(await settingsService.getDefaultTripId(database)).toBeNull();

		mocks.getSettingRow.mockResolvedValueOnce("trip1");
		expect(await settingsService.getDefaultTripId(database)).toBe("trip1");

		await settingsService.updateDefaultTripId(database, "trip2");
		expect(mocks.upsertSettingRow).toHaveBeenCalledWith(
			database,
			"default_trip_id",
			"trip2",
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);

		await settingsService.updateDefaultTripId(database, null);
		expect(mocks.upsertSettingRow).toHaveBeenCalledWith(
			database,
			"default_trip_id",
			"",
			expect.any(Number),
		);
	});
});
