import initializeDatabase from "@/database/initializeDatabase";

import { openDatabaseAsync } from "expo-sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";

import appConstants from "@/constants/appConstants";
import SCHEMA_MIGRATIONS from "@/database/migrations";
import SCHEMA_SQL from "@/database/schema";

vi.mock("expo-sqlite", () => ({
	openDatabaseAsync: vi.fn(),
}));

const { DATABASE_NAME } = appConstants;
const openDatabaseAsyncMock = vi.mocked(openDatabaseAsync);

describe("initializeDatabase", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("opens the app's database, applies the schema, then applies migrations in order", async () => {
		const execAsyncMock = vi.fn().mockResolvedValue(undefined);
		openDatabaseAsyncMock.mockResolvedValue({
			execAsync: execAsyncMock,
		} as never);

		const database = await initializeDatabase();

		expect(openDatabaseAsyncMock).toHaveBeenCalledWith(DATABASE_NAME);
		const executedStatements = execAsyncMock.mock.calls.map(
			(call: readonly unknown[]) => call[0],
		);
		expect(executedStatements[0]).toBe(SCHEMA_SQL);
		expect(executedStatements.slice(1)).toEqual(SCHEMA_MIGRATIONS);
		expect(database).toMatchObject({ execAsync: execAsyncMock });
	});

	it("silently ignores a migration that fails (e.g. column already exists)", async () => {
		const execAsyncMock = vi
			.fn()
			.mockImplementation((source: string): Promise<void> => {
				if (source === SCHEMA_MIGRATIONS[0]) {
					return Promise.reject(new Error("duplicate column name"));
				}
				return Promise.resolve();
			});
		openDatabaseAsyncMock.mockResolvedValue({
			execAsync: execAsyncMock,
		} as never);

		await expect(initializeDatabase()).resolves.toBeDefined();
		// Every migration was still attempted despite the first one failing.
		expect(execAsyncMock).toHaveBeenCalledTimes(
			1 + SCHEMA_MIGRATIONS.length,
		);
	});

	it("propagates a failure from applying the base schema itself", async () => {
		const execAsyncMock = vi.fn().mockRejectedValue(new Error("disk full"));
		openDatabaseAsyncMock.mockResolvedValue({
			execAsync: execAsyncMock,
		} as never);

		await expect(initializeDatabase()).rejects.toThrow("disk full");
	});
});
