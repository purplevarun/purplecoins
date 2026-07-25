import settingsRepository from "@/repositories/settingsRepository";

import { beforeEach, describe, expect, it } from "vitest";

import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const { getSettingRow, upsertSettingRow } = settingsRepository;

describe("settingsRepository", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	it("returns null for a setting that has never been set", async () => {
		expect(await getSettingRow(database, "unknown_key")).toBeNull();
	});

	it("stores and retrieves a setting value", async () => {
		await upsertSettingRow(database, "fy_start_month", "4", 1000);

		expect(await getSettingRow(database, "fy_start_month")).toBe("4");
	});

	it("overwrites an existing value on conflict", async () => {
		await upsertSettingRow(database, "default_home_mode", "TOOLS", 1000);
		await upsertSettingRow(database, "default_home_mode", "FINANCE", 2000);

		expect(await getSettingRow(database, "default_home_mode")).toBe(
			"FINANCE",
		);
	});

	it("keeps distinct keys independent", async () => {
		await upsertSettingRow(database, "key_a", "value_a", 1000);
		await upsertSettingRow(database, "key_b", "value_b", 1000);

		expect(await getSettingRow(database, "key_a")).toBe("value_a");
		expect(await getSettingRow(database, "key_b")).toBe("value_b");
	});
});
