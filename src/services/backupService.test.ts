import backupService from "@/services/backupService";

import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { backupDatabaseAsync, openDatabaseAsync } from "expo-sqlite";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SQLiteDatabase } from "expo-sqlite";

vi.mock("expo-document-picker", () => ({
	getDocumentAsync: vi.fn(),
}));

vi.mock("expo-sharing", () => ({
	isAvailableAsync: vi.fn(),
	shareAsync: vi.fn(),
}));

vi.mock("expo-file-system", () => ({
	File: vi.fn(),
	Paths: { cache: "mock://cache", document: "mock://document" },
}));

vi.mock("expo-sqlite", () => ({
	backupDatabaseAsync: vi.fn(),
	openDatabaseAsync: vi.fn(),
}));

const { exportBackup, restoreBackup } = backupService;

const getDocumentAsyncMock = vi.mocked(DocumentPicker.getDocumentAsync);
const isAvailableAsyncMock = vi.mocked(Sharing.isAvailableAsync);
const shareAsyncMock = vi.mocked(Sharing.shareAsync);
const FileMock = vi.mocked(File);
const backupDatabaseAsyncMock = vi.mocked(backupDatabaseAsync);
const openDatabaseAsyncMock = vi.mocked(openDatabaseAsync);

/**
 * `expo-file-system`'s `File` is used via `new File(...)`. A mocked
 * implementation must be a real `function` expression (not an arrow
 * function) to be constructible — `new (() => {})()` always throws, since
 * arrow functions have no `[[Construct]]` internal method.
 */
const mockFileImplementation = (shape: Record<string, unknown>): (() => File) =>
	function FakeFile(): File {
		return shape as unknown as File;
	};

const VALID_BACKUP_ASSET = {
	uri: "file://backup.purplecoins",
	name: "backup.purplecoins",
	lastModified: 0,
};

/** A fully fake SQLiteDatabase so integrity/serialize behavior is deterministic. */
const createFakeDatabase = (
	overrides: Partial<{
		getFirstAsync: (...args: unknown[]) => Promise<unknown>;
		serializeAsync: () => Promise<Uint8Array>;
		execAsync: (source: string) => Promise<void>;
	}> = {},
): SQLiteDatabase =>
	({
		getFirstAsync: vi.fn().mockResolvedValue({ integrity: "ok" }),
		serializeAsync: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
		execAsync: vi.fn().mockResolvedValue(undefined),
		...overrides,
	}) as unknown as SQLiteDatabase;

describe("backupService", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("exportBackup", () => {
		it("throws DATABASE_INTEGRITY_FAILED when the integrity check fails", async () => {
			const database = createFakeDatabase({
				getFirstAsync: vi
					.fn()
					.mockResolvedValue({ integrity: "corrupt" }),
			});

			await expect(exportBackup(database)).rejects.toMatchObject({
				code: "DATABASE_INTEGRITY_FAILED",
			});
		});

		it("throws DATABASE_INTEGRITY_FAILED when the integrity row is missing", async () => {
			const database = createFakeDatabase({
				getFirstAsync: vi.fn().mockResolvedValue(null),
			});

			await expect(exportBackup(database)).rejects.toMatchObject({
				code: "DATABASE_INTEGRITY_FAILED",
			});
		});

		it("throws SHARING_UNAVAILABLE when sharing is unavailable", async () => {
			const database = createFakeDatabase();
			FileMock.mockImplementation(
				mockFileImplementation({
					create: vi.fn(),
					write: vi.fn(),
					uri: "mock://out",
				}),
			);
			isAvailableAsyncMock.mockResolvedValue(false);

			await expect(exportBackup(database)).rejects.toMatchObject({
				code: "SHARING_UNAVAILABLE",
			});
		});

		it("writes the serialized database and shares it with the correct metadata", async () => {
			const database = createFakeDatabase();
			const createMock = vi.fn();
			const writeMock = vi.fn();
			FileMock.mockImplementation(
				mockFileImplementation({
					create: createMock,
					write: writeMock,
					uri: "mock://cache/backup-file",
				}),
			);
			isAvailableAsyncMock.mockResolvedValue(true);
			shareAsyncMock.mockResolvedValue(undefined);

			await exportBackup(database);

			expect(createMock).toHaveBeenCalledWith({
				overwrite: true,
				intermediates: true,
			});
			expect(writeMock).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]));
			expect(shareAsyncMock).toHaveBeenCalledWith(
				"mock://cache/backup-file",
				{
					mimeType: "application/x-sqlite3",
					dialogTitle: "Export Purplecoins backup",
				},
			);
			// File name should follow `purplecoins-YYYY-MM-DD.purplecoins`
			const [, fileNameArg] = FileMock.mock.calls[0] ?? [];
			expect(fileNameArg).toMatch(
				/^purplecoins-\d{4}-\d{2}-\d{2}\.purplecoins$/,
			);
		});
	});

	describe("restoreBackup", () => {
		it("returns false when the user cancels the picker", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: true,
				assets: null,
			});

			expect(await restoreBackup(createFakeDatabase())).toBe(false);
		});

		it("throws BACKUP_NOT_SELECTED when no asset is returned", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [],
			});

			await expect(
				restoreBackup(createFakeDatabase()),
			).rejects.toMatchObject({ code: "BACKUP_NOT_SELECTED" });
		});

		it("throws INVALID_BACKUP_EXTENSION for a non-.purplecoins file", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [
					{
						uri: "file://backup.zip",
						name: "backup.zip",
						lastModified: 0,
					},
				],
			});

			await expect(
				restoreBackup(createFakeDatabase()),
			).rejects.toMatchObject({ code: "INVALID_BACKUP_EXTENSION" });
		});

		it("accepts a .purplecoins extension case-insensitively", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [
					{
						uri: "file://backup.PURPLECOINS",
						name: "backup.PURPLECOINS",
						lastModified: 0,
					},
				],
			});
			const pickedBytes = new Uint8Array([9, 9]);
			let fileCallCount = 0;
			FileMock.mockImplementation(function FakeFile(): File {
				fileCallCount += 1;
				if (fileCallCount === 1) {
					// pickedFile
					return {
						bytes: (): Promise<Uint8Array> =>
							Promise.resolve(pickedBytes),
					} as unknown as File;
				}
				// directory placeholder + tempFile share simple stubs
				return {
					exists: false,
					delete: vi.fn(),
					create: vi.fn(),
					write: vi.fn(),
				} as unknown as File;
			});
			const closeAsyncMock = vi.fn().mockResolvedValue(undefined);
			openDatabaseAsyncMock.mockResolvedValue({
				closeAsync: closeAsyncMock,
			} as unknown as SQLiteDatabase);
			backupDatabaseAsyncMock.mockResolvedValue(undefined);
			const database = createFakeDatabase();

			const result = await restoreBackup(database);

			expect(result).toBe(true);
		});

		it("restores by delegating to backupDatabaseAsync, re-applying the schema, and checkpointing", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [VALID_BACKUP_ASSET],
			});
			FileMock.mockImplementation(
				mockFileImplementation({
					exists: false,
					delete: vi.fn(),
					create: vi.fn(),
					write: vi.fn(),
					bytes: (): Promise<Uint8Array> =>
						Promise.resolve(new Uint8Array()),
				}),
			);
			const closeAsyncMock = vi.fn().mockResolvedValue(undefined);
			const tempDatabase = {
				closeAsync: closeAsyncMock,
			} as unknown as SQLiteDatabase;
			openDatabaseAsyncMock.mockResolvedValue(tempDatabase);
			backupDatabaseAsyncMock.mockResolvedValue(undefined);
			const execAsyncMock = vi.fn().mockResolvedValue(undefined);
			const database = createFakeDatabase({ execAsync: execAsyncMock });

			const result = await restoreBackup(database);

			expect(result).toBe(true);
			expect(backupDatabaseAsyncMock).toHaveBeenCalledWith({
				sourceDatabase: tempDatabase,
				destDatabase: database,
			});
			expect(execAsyncMock).toHaveBeenCalledWith(
				expect.stringContaining("CREATE TABLE"),
			);
			expect(execAsyncMock).toHaveBeenCalledWith(
				expect.stringContaining("wal_checkpoint"),
			);
			expect(closeAsyncMock).toHaveBeenCalled();
		});

		it("still closes the temp database when backupDatabaseAsync throws", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [VALID_BACKUP_ASSET],
			});
			FileMock.mockImplementation(
				mockFileImplementation({
					exists: false,
					delete: vi.fn(),
					create: vi.fn(),
					write: vi.fn(),
					bytes: (): Promise<Uint8Array> =>
						Promise.resolve(new Uint8Array()),
				}),
			);
			const closeAsyncMock = vi.fn().mockResolvedValue(undefined);
			openDatabaseAsyncMock.mockResolvedValue({
				closeAsync: closeAsyncMock,
			} as unknown as SQLiteDatabase);
			backupDatabaseAsyncMock.mockRejectedValue(new Error("boom"));

			await expect(restoreBackup(createFakeDatabase())).rejects.toThrow(
				"boom",
			);
			expect(closeAsyncMock).toHaveBeenCalled();
		});

		it("deletes a pre-existing temp file before writing the new one", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [VALID_BACKUP_ASSET],
			});
			const tempDeleteMock = vi.fn();
			let fileCallCount = 0;
			FileMock.mockImplementation(function FakeFile(): File {
				fileCallCount += 1;
				if (fileCallCount === 1) {
					return {
						bytes: (): Promise<Uint8Array> =>
							Promise.resolve(new Uint8Array()),
					} as unknown as File;
				}
				if (fileCallCount === 3) {
					// tempFile — simulate a leftover file from a previous attempt
					return {
						exists: true,
						delete: tempDeleteMock,
						create: vi.fn(),
						write: vi.fn(),
					} as unknown as File;
				}
				return {} as unknown as File;
			});
			openDatabaseAsyncMock.mockResolvedValue({
				closeAsync: vi.fn().mockResolvedValue(undefined),
			} as unknown as SQLiteDatabase);
			backupDatabaseAsyncMock.mockResolvedValue(undefined);

			await restoreBackup(createFakeDatabase());

			expect(tempDeleteMock).toHaveBeenCalled();
		});
	});
});
