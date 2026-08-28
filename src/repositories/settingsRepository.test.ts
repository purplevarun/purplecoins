import settingsRepository from "@/repositories/settingsRepository";

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

	it("upserts setting row", async () => {
		const database = { runAsync: vi.fn(async () => {}) } as any;
		await upsertSettingRow(database, "k", "v", 123);
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO settings"),
			"k",
			"v",
			123,
		);
	});
});
