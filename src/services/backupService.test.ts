import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getDocumentAsync: vi.fn(async () => ({ canceled: true })),
	isAvailableAsync: vi.fn(async () => true),
	shareAsync: vi.fn(async () => {}),
	backupDatabaseAsync: vi.fn(async () => {}),
	openDatabaseAsync: vi.fn(async () => ({ closeAsync: vi.fn(async () => {}) })),
	fileBytes: vi.fn(async () => new Uint8Array([1, 2, 3])),
	fileCreate: vi.fn(() => {}),
	fileWrite: vi.fn(() => {}),
	fileDelete: vi.fn(() => {}),
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
	execAsync: vi.fn(async () => {}),
} as any;

describe("backupService", () => {
	beforeEach(() => {
		Object.values(mocks).forEach((mockFn) => {
			if (typeof mockFn === "function" && "mockClear" in mockFn) mockFn.mockClear();
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
			expect.objectContaining({ dialogTitle: "Export Purplecoins backup" }),
		);
	});

	it("rejects export when integrity fails or sharing unavailable", async () => {
		database.getFirstAsync.mockResolvedValueOnce({ integrity: "corrupt" });
		await expect(backupService.exportBackup(database)).rejects.toMatchObject<AppError>({
			code: "DATABASE_INTEGRITY_FAILED",
		});

		database.getFirstAsync.mockResolvedValueOnce({ integrity: "ok" });
		mocks.isAvailableAsync.mockResolvedValueOnce(false);
		await expect(backupService.exportBackup(database)).rejects.toMatchObject<AppError>({
			code: "SHARING_UNAVAILABLE",
		});
	});

	it("restoreBackup returns false when picker canceled", async () => {
		mocks.getDocumentAsync.mockResolvedValueOnce({ canceled: true });
		expect(await backupService.restoreBackup(database)).toBe(false);
	});

	it("restoreBackup validates asset and extension", async () => {
		mocks.getDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [] });
		await expect(backupService.restoreBackup(database)).rejects.toMatchObject<AppError>({
			code: "BACKUP_NOT_SELECTED",
		});

		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [{ uri: "file://bad.txt", name: "bad.txt" }],
		});
		await expect(backupService.restoreBackup(database)).rejects.toMatchObject<AppError>({
			code: "INVALID_BACKUP_EXTENSION",
		});
	});

	it("restoreBackup copies file, restores DB, and cleans up", async () => {
		const closeAsync = vi.fn(async () => {});
		mocks.openDatabaseAsync.mockResolvedValueOnce({ closeAsync });
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [{ uri: "file://ok.purplecoins", name: "ok.purplecoins" }],
		});

		expect(await backupService.restoreBackup(database)).toBe(true);
		expect(mocks.backupDatabaseAsync).toHaveBeenCalledWith(
			expect.objectContaining({ destDatabase: database }),
		);
		expect(database.execAsync).toHaveBeenNthCalledWith(1, "SCHEMA_SQL");
		expect(database.execAsync).toHaveBeenNthCalledWith(
			2,
			"PRAGMA wal_checkpoint(TRUNCATE);",
		);
		expect(closeAsync).toHaveBeenCalled();
		expect(mocks.fileDelete).toHaveBeenCalled();
	});

	it("restoreBackup skips temp-file deletes when file does not exist", async () => {
		const closeAsync = vi.fn(async () => {});
		mocks.openDatabaseAsync.mockResolvedValueOnce({ closeAsync });
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
});
