import type TestAsyncFunction from "@/types/testing/TestAsyncFunction";
import type TestCallback from "@/types/testing/TestCallback";
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
	migrateDatabase: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
	openDatabaseAsync: vi.fn(async () => ({
		closeAsync: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
		getFirstAsync: vi.fn(async () => ({ count: 4 })),
	})),
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
	default: mocks.migrateDatabase,
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

		constructor(baseOrUri: any, name?: string) {
			if (name) {
				this.uri = `${baseOrUri.uri ?? baseOrUri}/${name}`;
			} else if (typeof baseOrUri === "string") {
				this.uri = baseOrUri;
			} else {
				this.uri = String(baseOrUri);
			}
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
		Paths: {
			cache: "cache-dir",
			document: "doc-dir",
		},
	};
});

import backupService from "@/services/backupService";

const database = {
	getFirstAsync: vi.fn(async () => ({ integrity: "ok" })),
	serializeAsync: vi.fn(async () => new Uint8Array([5, 6])),
	execAsync: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
} as any;

describe("backupService", () => {
	beforeEach(() => {
		Object.values(mocks).forEach((mockFn) => {
			if (typeof mockFn === "function" && "mockClear" in mockFn)
				mockFn.mockClear();
		});
		database.getFirstAsync.mockClear();
		database.serializeAsync.mockClear();
		database.execAsync.mockClear();
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T10:00:00.000Z"));
		mocks.tempFileStartsExisting = true;
		mocks.tempFileExistsAfterCreate = true;
	});

	it("exports backup when integrity is ok", async () => {
		await backupService.exportBackup(database);
		expect(database.getFirstAsync).toHaveBeenCalled();
		expect(database.serializeAsync).toHaveBeenCalled();
		expect(mocks.fileCreate).toHaveBeenCalled();
		expect(mocks.fileWrite).toHaveBeenCalledWith(new Uint8Array([5, 6]));
		expect(mocks.shareAsync).toHaveBeenCalledWith(
			"cache-dir/purplecoins-2026-08-25.purplecoins",
			expect.objectContaining({
				dialogTitle: "Export Purplecoins backup",
			}),
		);
	});

	it("rejects export when integrity fails or sharing unavailable", async () => {
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
	});

	it("restoreBackup returns false when picker canceled", async () => {
		mocks.getDocumentAsync.mockResolvedValueOnce({ canceled: true });
		expect(await backupService.restoreBackup(database)).toBe(false);
	});

	it("restoreBackup validates asset and extension", async () => {
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [],
		});
		await expect(
			backupService.restoreBackup(database),
		).rejects.toMatchObject({
			code: "BACKUP_NOT_SELECTED",
		});

		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [{ uri: "file://bad.txt", name: "bad.txt" }],
		});
		await expect(
			backupService.restoreBackup(database),
		).rejects.toMatchObject({
			code: "INVALID_BACKUP_EXTENSION",
		});
	});

	it("restoreBackup copies file, restores DB, and cleans up", async () => {
		const closeAsync = vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined);
		const tempDatabase = {
			closeAsync,
			getFirstAsync: vi.fn(async () => ({ count: 4 })),
		};
		mocks.openDatabaseAsync.mockResolvedValueOnce(tempDatabase);
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [{ uri: "file://ok.purplecoins", name: "ok.purplecoins" }],
		});

		expect(await backupService.restoreBackup(database)).toBe(true);
		expect(mocks.backupDatabaseAsync).toHaveBeenCalledWith(
			expect.objectContaining({ destDatabase: database }),
		);
		expect(mocks.migrateDatabase).toHaveBeenCalledWith(tempDatabase);
		expect(mocks.migrateDatabase.mock.invocationCallOrder[0]).toBeLessThan(
			mocks.backupDatabaseAsync.mock.invocationCallOrder[0] ?? 0,
		);
		expect(database.execAsync).toHaveBeenNthCalledWith(
			1,
			"PRAGMA wal_checkpoint(TRUNCATE);",
		);
		expect(closeAsync).toHaveBeenCalled();
		expect(mocks.fileDelete).toHaveBeenCalled();
	});

	it("restoreBackup skips temp-file deletes when file does not exist", async () => {
		const closeAsync = vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined);
		mocks.openDatabaseAsync.mockResolvedValueOnce({
			closeAsync,
			getFirstAsync: vi.fn(async () => ({ count: 4 })),
		});
		mocks.tempFileStartsExisting = false;
		mocks.tempFileExistsAfterCreate = false;
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [{ uri: "file://ok.purplecoins", name: "ok.purplecoins" }],
		});

		expect(await backupService.restoreBackup(database)).toBe(true);
		expect(closeAsync).toHaveBeenCalled();
		expect(mocks.fileDelete).not.toHaveBeenCalled();
	});

	it("keeps the live database untouched if the backup migration fails", async () => {
		const closeAsync = vi
			.fn<TestAsyncFunction>()
			.mockResolvedValue(undefined);
		mocks.openDatabaseAsync.mockResolvedValueOnce({
			closeAsync,
			getFirstAsync: vi.fn(async () => ({ count: 4 })),
		});
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [
				{ uri: "file://old.purplecoins", name: "old.purplecoins" },
			],
		});
		mocks.migrateDatabase.mockRejectedValueOnce(
			new Error("upgrade failed"),
		);
		await expect(backupService.restoreBackup(database)).rejects.toThrow(
			"upgrade failed",
		);
		expect(mocks.backupDatabaseAsync).not.toHaveBeenCalled();
		expect(database.execAsync).not.toHaveBeenCalled();
		expect(closeAsync).toHaveBeenCalledOnce();
		expect(mocks.fileDelete).toHaveBeenCalled();
	});

	it("rejects an unrelated SQLite file before replacing live data", async () => {
		mocks.openDatabaseAsync.mockResolvedValueOnce({
			closeAsync: vi.fn<TestAsyncFunction>().mockResolvedValue(undefined),
			getFirstAsync: vi.fn(async () => ({ count: 0 })),
		});
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [
				{ uri: "file://other.purplecoins", name: "other.purplecoins" },
			],
		});
		await expect(
			backupService.restoreBackup(database),
		).rejects.toMatchObject({ code: "INVALID_BACKUP_DATABASE" });
		expect(mocks.migrateDatabase).not.toHaveBeenCalled();
		expect(mocks.backupDatabaseAsync).not.toHaveBeenCalled();
	});
});
