import settingsRepository from "@/repositories/settingsRepository";
import type TestAsyncFunction from "@test/types/TestAsyncFunction";

import { describe, expect, it, vi } from "vitest";

const { getSettingRow, upsertSettingRow } = settingsRepository;

describe("settingsRepository", () => {
	it("returns setting value or null", async () => {
		const database = {
			getFirstAsync: vi
				.fn()
				.mockResolvedValueOnce({ value: "true" })
				.mockResolvedValueOnce(null),
		} as any;

		expect(await getSettingRow(database, "native_currency_display")).toBe(
			"true",
		);
		expect(await getSettingRow(database, "missing")).toBeNull();
		expect(database.getFirstAsync).toHaveBeenCalledTimes(2);
	});

	it("inserts setting row when no existing row matches", async () => {
		const database = {
			runAsync: vi
				.fn<TestAsyncFunction>()
				.mockResolvedValue({ changes: 0 }),
		} as any;
		await upsertSettingRow(database, "k", "v", 123);
		expect(database.runAsync).toHaveBeenCalledWith(
			"UPDATE settings SET value = ?, updated_at = ? WHERE key = ?;",
			"v",
			123,
			"k",
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO settings"),
			"k",
			"v",
			123,
		);
	});

	it("updates existing setting row without inserting", async () => {
		const database = {
			runAsync: vi
				.fn<TestAsyncFunction>()
				.mockResolvedValue({ changes: 1 }),
		} as any;
		await upsertSettingRow(database, "k", "v", 123);
		expect(database.runAsync).toHaveBeenCalledTimes(1);
		expect(database.runAsync).toHaveBeenCalledWith(
			"UPDATE settings SET value = ?, updated_at = ? WHERE key = ?;",
			"v",
			123,
			"k",
		);
	});
});
