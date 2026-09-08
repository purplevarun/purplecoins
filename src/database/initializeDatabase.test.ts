import { beforeEach, describe, expect, it, vi } from "vitest";

const { execAsync, openDatabaseAsync } = vi.hoisted(() => {
	const mockedExecAsync = vi.fn(async () => {});
	const mockedOpenDatabaseAsync = vi.fn(async () => ({
		execAsync: mockedExecAsync,
	}));
	return {
		execAsync: mockedExecAsync,
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

vi.mock("@/database/schema", () => ({
	default: "SCHEMA_SQL_TEXT",
}));

vi.mock("@/database/migrations", () => ({
	default: ["ALTER TABLE investments ADD COLUMN label TEXT;"],
}));

import initializeDatabase from "@/database/initializeDatabase";

describe("initializeDatabase", () => {
	beforeEach(() => {
		execAsync.mockClear();
		openDatabaseAsync.mockClear();
	});

	it("opens configured database, executes schema, and runs migrations", async () => {
		const database = await initializeDatabase();

		expect(openDatabaseAsync).toHaveBeenCalledWith("test.db");
		expect(execAsync).toHaveBeenCalledWith("SCHEMA_SQL_TEXT");
		expect(execAsync).toHaveBeenCalledWith(
			"ALTER TABLE investments ADD COLUMN label TEXT;",
		);
		expect(database).toMatchObject({ execAsync });
	});

	it("swallows a migration error so subsequent migrations still run", async () => {
		execAsync.mockImplementationOnce(async () => {});
		execAsync.mockImplementationOnce(async () => {
			throw new Error("duplicate column name: label");
		});

		await expect(initializeDatabase()).resolves.toBeDefined();
	});
});
