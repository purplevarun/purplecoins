import settingsService from "@/services/settingsService";

import { beforeEach, describe, expect, it } from "vitest";

import settingsRepository from "@/repositories/settingsRepository";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	getBudgetAlertsEnabled,
	getDefaultHomeMode,
	getDefaultTripId,
	getFyStartMonth,
	getNativeCurrencyDisplay,
	getTodoReminderSettings,
	updateBudgetAlertsEnabled,
	updateDefaultHomeMode,
	updateDefaultTripId,
	updateFyStartMonth,
	updateNativeCurrencyDisplay,
	updateTodoReminderDaysBeforeDue,
	updateTodoReminderRepeatHours,
	updateTodoRemindersEnabled,
} = settingsService;
const { upsertSettingRow } = settingsRepository;

describe("settingsService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("native currency display", () => {
		it("defaults to true when never set", async () => {
			expect(await getNativeCurrencyDisplay(database)).toBe(true);
		});

		it("round-trips false", async () => {
			await updateNativeCurrencyDisplay(database, false);
			expect(await getNativeCurrencyDisplay(database)).toBe(false);
		});

		it("round-trips true explicitly", async () => {
			await updateNativeCurrencyDisplay(database, false);
			await updateNativeCurrencyDisplay(database, true);
			expect(await getNativeCurrencyDisplay(database)).toBe(true);
		});
	});

	describe("FY start month", () => {
		it("defaults to April (4) when never set", async () => {
			expect(await getFyStartMonth(database)).toBe(4);
		});

		it("round-trips a custom month", async () => {
			await updateFyStartMonth(database, 1);
			expect(await getFyStartMonth(database)).toBe(1);
		});

		it("falls back to 4 when the stored value is not a number", async () => {
			await upsertSettingRow(
				database,
				"fy_start_month",
				"not-a-number",
				1,
			);
			expect(await getFyStartMonth(database)).toBe(4);
		});
	});

	describe("default trip", () => {
		it("defaults to null when never set", async () => {
			expect(await getDefaultTripId(database)).toBeNull();
		});

		it("round-trips a trip id", async () => {
			await updateDefaultTripId(database, "trip-1");
			expect(await getDefaultTripId(database)).toBe("trip-1");
		});

		it("stores a cleared (null) trip as an empty string, not a deleted row", async () => {
			// getDefaultTripId only returns null when the setting has never
			// been written (`getSettingRow` returns a real `null` row).
			// Clearing writes the literal empty string "" as the value, so
			// once set, "clearing" reads back as "" rather than null.
			await updateDefaultTripId(database, "trip-1");
			await updateDefaultTripId(database, null);
			expect(await getDefaultTripId(database)).toBe("");
		});
	});

	describe("default home mode", () => {
		it("defaults to TOOLS when never set", async () => {
			expect(await getDefaultHomeMode(database)).toBe("TOOLS");
		});

		it("round-trips a valid mode", async () => {
			await updateDefaultHomeMode(database, "FINANCE");
			expect(await getDefaultHomeMode(database)).toBe("FINANCE");
		});

		it("falls back to TOOLS when the stored value is not a valid mode", async () => {
			await upsertSettingRow(
				database,
				"default_home_mode",
				"NOT_A_MODE",
				1,
			);
			expect(await getDefaultHomeMode(database)).toBe("TOOLS");
		});
	});

	describe("budget alerts enabled", () => {
		it("defaults to true when never set", async () => {
			expect(await getBudgetAlertsEnabled(database)).toBe(true);
		});

		it("round-trips false", async () => {
			await updateBudgetAlertsEnabled(database, false);
			expect(await getBudgetAlertsEnabled(database)).toBe(false);
		});

		it("round-trips true explicitly", async () => {
			await updateBudgetAlertsEnabled(database, false);
			await updateBudgetAlertsEnabled(database, true);
			expect(await getBudgetAlertsEnabled(database)).toBe(true);
		});
	});

	describe("todo reminder settings", () => {
		it("defaults to enabled with a 2 day / 12 hour cadence", async () => {
			expect(await getTodoReminderSettings(database)).toEqual({
				enabled: true,
				daysBeforeDue: 2,
				repeatHours: 12,
			});
		});

		it("round-trips reminder settings", async () => {
			await updateTodoRemindersEnabled(database, false);
			await updateTodoReminderDaysBeforeDue(database, 5);
			await updateTodoReminderRepeatHours(database, 6);
			expect(await getTodoReminderSettings(database)).toEqual({
				enabled: false,
				daysBeforeDue: 5,
				repeatHours: 6,
			});
		});

		it("clamps invalid reminder values back into supported ranges", async () => {
			await upsertSettingRow(
				database,
				"todo_reminder_days_before_due",
				"999",
				1,
			);
			await upsertSettingRow(
				database,
				"todo_reminder_repeat_hours",
				"0",
				1,
			);
			expect(await getTodoReminderSettings(database)).toEqual({
				enabled: true,
				daysBeforeDue: 30,
				repeatHours: 1,
			});
		});

		it("falls back to defaults when stored reminder values are not numbers", async () => {
			await upsertSettingRow(
				database,
				"todo_reminder_days_before_due",
				"not-a-number",
				1,
			);
			await upsertSettingRow(
				database,
				"todo_reminder_repeat_hours",
				"not-a-number",
				1,
			);
			expect(await getTodoReminderSettings(database)).toEqual({
				enabled: true,
				daysBeforeDue: 2,
				repeatHours: 12,
			});
		});
	});
});
