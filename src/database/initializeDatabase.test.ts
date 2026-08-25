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

import initializeDatabase from "@/database/initializeDatabase";

describe("initializeDatabase", () => {
	beforeEach(() => {
		execAsync.mockClear();
		openDatabaseAsync.mockClear();
	});

	it("opens configured database and executes schema", async () => {
		const database = await initializeDatabase();

		expect(openDatabaseAsync).toHaveBeenCalledWith("test.db");
		expect(execAsync).toHaveBeenCalledWith("SCHEMA_SQL_TEXT");
		expect(database).toMatchObject({ execAsync });
	});
});
