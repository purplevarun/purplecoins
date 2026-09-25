import type TestAsyncFunction from "@test/types/TestAsyncFunction";
import type TestCallback from "@test/types/TestCallback";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getDocumentAsync: vi
		.fn<TestAsyncFunction>()
		.mockResolvedValue({ canceled: true }),
	isAvailableAsync: vi.fn(async () => true),
	shareAsync: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
	backupDatabaseAsync: vi
		.fn<TestAsyncFunction>()
		.mockResolvedValue(undefined),
	openDatabaseAsync: vi.fn(),
	fileBytes: vi.fn(async () => new Uint8Array([1, 2, 3])),
	fileCreate: vi.fn<TestCallback>().mockReturnValue(undefined),
	fileWrite: vi.fn<TestCallback>().mockReturnValue(undefined),
	fileDelete: vi.fn<TestCallback>().mockReturnValue(undefined),
	tempFileStartsExisting: true,
	tempFileExistsAfterCreate: true,
}));

vi.mock("@/constants/appConstants", () => ({
	default: {
		APP_NAME: "PurpleCoins",
		BACKUP_EXTENSION: ".purplecoins",
		BACKUP_MIME_TYPE: "application/octet-stream",
	},
}));

vi.mock("@/database/migrations", () => ({
	default: ["FUTURE_MIGRATION_SQL"],
}));

vi.mock("@/database/schema", () => ({
	default: "SCHEMA_SQL",
}));

vi.mock("expo-document-picker", () => ({
	getDocumentAsync: mocks.getDocumentAsync,
}));

vi.mock("expo-sharing", () => ({
	isAvailableAsync: mocks.isAvailableAsync,
	shareAsync: mocks.shareAsync,
}));

vi.mock("expo-sqlite", () => ({
	backupDatabaseAsync: mocks.backupDatabaseAsync,
	openDatabaseAsync: mocks.openDatabaseAsync,
}));

vi.mock("expo-file-system", () => {
	class MockFile {
		uri: string;
		exists = false;

		constructor(baseOrUri: unknown, name?: string) {
			this.uri = name
				? `${String(baseOrUri).replace("[object Object]", "doc-dir")}/${name}`
				: String(baseOrUri);
			if (this.uri.includes("restore-temp.db")) {
				this.exists = mocks.tempFileStartsExisting;
			}
		}

		async bytes(): Promise<Uint8Array> {
			return mocks.fileBytes();
		}

		create(): void {
			this.exists = mocks.tempFileExistsAfterCreate;
			mocks.fileCreate();
		}

		write(content: Uint8Array): void {
			mocks.fileWrite(content);
		}

		delete(): void {
			this.exists = false;
			mocks.fileDelete();
		}
	}

	return {
		File: MockFile,
		Paths: { cache: "cache-dir", document: "doc-dir" },
	};
});

import backupService from "@/services/backupService";

const database = {
	getFirstAsync: vi.fn(async () => ({ integrity: "ok" })),
	serializeAsync: vi.fn(async () => new Uint8Array([5, 6])),
	execAsync: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
} as any;

const validTempDatabase = () => ({
	closeAsync: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
	getFirstAsync: vi.fn(async () => ({ count: 5 })),
	execAsync: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
});

const selectBackup = (name = "ok.purplecoins"): void => {
	mocks.getDocumentAsync.mockResolvedValueOnce({
		canceled: false,
		assets: [{ uri: `file://${name}`, name }],
	});
};

describe("backupService", () => {
	it.each([
		new Error("disk failure"),
		"native failure",
		new Error("duplicate column name: platform_id"),
	])("handles restore migration errors: %s", async (error) => {
		selectBackup();
		const temp = validTempDatabase();
		temp.execAsync
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(error);
		mocks.openDatabaseAsync.mockResolvedValueOnce(temp);
		if (
			error instanceof Error &&
			error.message.includes("duplicate column name")
		) {
			await expect(backupService.restoreBackup(database)).resolves.toBe(
				true,
			);
			expect(mocks.backupDatabaseAsync).toHaveBeenCalled();
		} else {
			await expect(backupService.restoreBackup(database)).rejects.toBe(
				error,
			);
			expect(mocks.backupDatabaseAsync).not.toHaveBeenCalled();
		}
		expect(temp.closeAsync).toHaveBeenCalledOnce();
	});
	beforeEach(() => {
		Object.values(mocks).forEach((mockFn) => {
			if (typeof mockFn === "function" && "mockReset" in mockFn) {
				mockFn.mockReset();
			}
		});
		mocks.getDocumentAsync.mockResolvedValue({ canceled: true });
		mocks.isAvailableAsync.mockResolvedValue(true);
		mocks.shareAsync.mockResolvedValue(undefined);
		mocks.backupDatabaseAsync.mockResolvedValue(undefined);
		mocks.fileBytes.mockResolvedValue(new Uint8Array([1, 2, 3]));
		database.getFirstAsync.mockReset();
		database.getFirstAsync.mockResolvedValue({ integrity: "ok" });
		database.serializeAsync.mockReset();
		database.serializeAsync.mockResolvedValue(new Uint8Array([5, 6]));
		database.execAsync.mockReset();
		database.execAsync.mockResolvedValue(undefined);
		mocks.tempFileStartsExisting = true;
		mocks.tempFileExistsAfterCreate = true;
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T10:00:00.000Z"));
	});

	it("exports a verified backup", async () => {
		await backupService.exportBackup(database);
		expect(database.serializeAsync).toHaveBeenCalledOnce();
		expect(mocks.fileWrite).toHaveBeenCalledWith(new Uint8Array([5, 6]));
		expect(mocks.shareAsync).toHaveBeenCalledWith(
			"cache-dir/purplecoins-2026-08-25.purplecoins",
			expect.objectContaining({
				dialogTitle: "Export Purplecoins backup",
			}),
		);
	});

	it("rejects invalid exports and canceled restores", async () => {
		database.getFirstAsync.mockResolvedValueOnce({ integrity: "corrupt" });
		await expect(
			backupService.exportBackup(database),
		).rejects.toMatchObject({
			code: "DATABASE_INTEGRITY_FAILED",
		});
		database.getFirstAsync.mockResolvedValueOnce({ integrity: "ok" });
		mocks.isAvailableAsync.mockResolvedValueOnce(false);
		await expect(
			backupService.exportBackup(database),
		).rejects.toMatchObject({
			code: "SHARING_UNAVAILABLE",
		});
		expect(await backupService.restoreBackup(database)).toBe(false);
	});

	it("validates a selected backup extension and database shape", async () => {
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [],
		});
		await expect(
			backupService.restoreBackup(database),
		).rejects.toMatchObject({
			code: "BACKUP_NOT_SELECTED",
		});
		selectBackup("bad.txt");
		await expect(
			backupService.restoreBackup(database),
		).rejects.toMatchObject({
			code: "INVALID_BACKUP_EXTENSION",
		});
		const tempDatabase = {
			...validTempDatabase(),
			getFirstAsync: vi.fn(async () => ({ count: 0 })),
		};
		mocks.openDatabaseAsync.mockResolvedValueOnce(tempDatabase);
		selectBackup();
		await expect(
			backupService.restoreBackup(database),
		).rejects.toMatchObject({
			code: "INVALID_BACKUP_DATABASE",
		});
		expect(mocks.backupDatabaseAsync).not.toHaveBeenCalled();
	});

	it("accepts a backup extension with different casing", async () => {
		const tempDatabase = validTempDatabase();
		mocks.openDatabaseAsync.mockResolvedValueOnce(tempDatabase);
		selectBackup("OK.PURPLECOINS");
		expect(await backupService.restoreBackup(database)).toBe(true);
	});

	it("runs schema and future migrations before restoring a valid backup", async () => {
		const tempDatabase = validTempDatabase();
		mocks.openDatabaseAsync.mockResolvedValueOnce(tempDatabase);
		selectBackup();
		expect(await backupService.restoreBackup(database)).toBe(true);
		expect(tempDatabase.execAsync).toHaveBeenNthCalledWith(1, "SCHEMA_SQL");
		expect(tempDatabase.execAsync).toHaveBeenNthCalledWith(
			2,
			"FUTURE_MIGRATION_SQL",
		);
		expect(mocks.backupDatabaseAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				sourceDatabase: tempDatabase,
				destDatabase: database,
			}),
		);
		expect(database.execAsync).toHaveBeenCalledWith(
			"PRAGMA wal_checkpoint(TRUNCATE);",
		);
		expect(tempDatabase.closeAsync).toHaveBeenCalledOnce();
		expect(mocks.fileDelete).toHaveBeenCalled();
	});

	it("keeps live data untouched when schema or migration SQL fails", async () => {
		const tempDatabase = validTempDatabase();
		tempDatabase.execAsync.mockRejectedValueOnce(
			new Error("schema failed"),
		);
		mocks.openDatabaseAsync.mockResolvedValueOnce(tempDatabase);
		selectBackup();
		await expect(backupService.restoreBackup(database)).rejects.toThrow(
			"schema failed",
		);
		expect(mocks.backupDatabaseAsync).not.toHaveBeenCalled();
		expect(database.execAsync).not.toHaveBeenCalled();
		expect(tempDatabase.closeAsync).toHaveBeenCalledOnce();
	});

	it("cleans up conditionally when the temporary file was not created", async () => {
		mocks.tempFileStartsExisting = false;
		mocks.tempFileExistsAfterCreate = false;
		const tempDatabase = validTempDatabase();
		mocks.openDatabaseAsync.mockResolvedValueOnce(tempDatabase);
		selectBackup();
		expect(await backupService.restoreBackup(database)).toBe(true);
		expect(mocks.fileDelete).not.toHaveBeenCalled();
	});
});
