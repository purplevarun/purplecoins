import type TestAsyncFunction from "@/types/testing/TestAsyncFunction";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { execAsync, closeAsync, migrateDatabase, openDatabaseAsync } =
	vi.hoisted(() => {
		const mockedExecAsync = vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined);
		const mockedCloseAsync = vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined);
		const mockedOpenDatabaseAsync = vi.fn(async () => ({
			execAsync: mockedExecAsync,
			closeAsync: mockedCloseAsync,
		}));
		return {
			execAsync: mockedExecAsync,
			closeAsync: mockedCloseAsync,
			migrateDatabase: vi
				.fn<TestAsyncFunction>()
				.mockResolvedValue(undefined),
			openDatabaseAsync: mockedOpenDatabaseAsync,
		};
	});

vi.mock("expo-sqlite", () => ({
	openDatabaseAsync,
}));

vi.mock("@/constants/appConstants", () => ({
	default: {
		DATABASE_NAME: "test.db",
	},
}));

vi.mock("@/database/migrations", () => ({
	default: migrateDatabase,
}));

import initializeDatabase from "@/database/initializeDatabase";

describe("initializeDatabase", () => {
	beforeEach(() => {
		execAsync.mockClear();
		closeAsync.mockClear();
		migrateDatabase.mockClear();
		openDatabaseAsync.mockClear();
	});

	it("opens the configured database and completes migrations before returning", async () => {
		const database = await initializeDatabase();

		expect(openDatabaseAsync).toHaveBeenCalledWith("test.db");
		expect(migrateDatabase).toHaveBeenCalledWith(database);
		expect(closeAsync).not.toHaveBeenCalled();
		expect(database).toMatchObject({ execAsync });
	});

	it("closes the database and propagates migration failures", async () => {
		migrateDatabase.mockRejectedValueOnce(new Error("upgrade failed"));
		await expect(initializeDatabase()).rejects.toThrow("upgrade failed");
		expect(closeAsync).toHaveBeenCalledOnce();
	});
});
