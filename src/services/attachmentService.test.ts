import attachmentService from "@/services/attachmentService";

import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import createTestDatabase from "@/test/sqliteTestDatabase";
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

const {
	deleteAttachment,
	getAttachmentMetadata,
	openAttachment,
	pickAttachment,
	saveAttachment,
} = attachmentService;

const getDocumentAsyncMock = vi.mocked(DocumentPicker.getDocumentAsync);
const isAvailableAsyncMock = vi.mocked(Sharing.isAvailableAsync);
const shareAsyncMock = vi.mocked(Sharing.shareAsync);
const FileMock = vi.mocked(File);

const TWO_MB = 2 * 1024 * 1024;

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

describe("attachmentService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
		vi.clearAllMocks();
	});

	describe("pickAttachment", () => {
		it("returns null when the user cancels the picker", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: true,
				assets: null,
			});

			expect(await pickAttachment()).toBeNull();
		});

		it("throws ATTACHMENT_PICK_FAILED when no asset is returned", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [],
			});

			await expect(pickAttachment()).rejects.toMatchObject({
				code: "ATTACHMENT_PICK_FAILED",
			});
		});

		it("throws ATTACHMENT_TOO_LARGE when the asset exceeds the size limit", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [
					{
						uri: "file://photo.jpg",
						name: "photo.jpg",
						size: TWO_MB + 1,
						mimeType: "image/jpeg",
						lastModified: 0,
					},
				],
			});
			FileMock.mockImplementation(
				mockFileImplementation({
					size: TWO_MB + 1,
					bytes: (): Promise<Uint8Array> =>
						Promise.resolve(new Uint8Array()),
				}),
			);

			await expect(pickAttachment()).rejects.toMatchObject({
				code: "ATTACHMENT_TOO_LARGE",
			});
		});

		it("throws ATTACHMENT_TOO_LARGE when size is falsy on both asset and file", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [
					{
						uri: "file://photo.jpg",
						name: "photo.jpg",
						size: 0,
						mimeType: "image/jpeg",
						lastModified: 0,
					},
				],
			});
			FileMock.mockImplementation(
				mockFileImplementation({
					size: 0,
					bytes: (): Promise<Uint8Array> =>
						Promise.resolve(new Uint8Array()),
				}),
			);

			await expect(pickAttachment()).rejects.toMatchObject({
				code: "ATTACHMENT_TOO_LARGE",
			});
		});

		it("returns attachment input built from the picked asset", async () => {
			const bytes = new Uint8Array([1, 2, 3]);
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [
					{
						uri: "file://photo.jpg",
						name: "photo.jpg",
						size: 3,
						mimeType: "image/jpeg",
						lastModified: 0,
					},
				],
			});
			FileMock.mockImplementation(
				mockFileImplementation({
					size: 3,
					bytes: (): Promise<Uint8Array> => Promise.resolve(bytes),
				}),
			);

			const attachment = await pickAttachment();

			expect(attachment).toEqual({
				fileName: "photo.jpg",
				mimeType: "image/jpeg",
				sizeBytes: 3,
				content: bytes,
			});
		});

		it("falls back to the file's own size when the asset omits one", async () => {
			getDocumentAsyncMock.mockResolvedValue({
				canceled: false,
				assets: [
					{
						uri: "file://photo.jpg",
						name: "photo.jpg",
						size: undefined,
						mimeType: undefined,
						lastModified: 0,
					},
				],
			});
			FileMock.mockImplementation(
				mockFileImplementation({
					size: 42,
					bytes: (): Promise<Uint8Array> =>
						Promise.resolve(new Uint8Array(42)),
				}),
			);

			const attachment = await pickAttachment();

			expect(attachment?.sizeBytes).toBe(42);
			// falls back to BACKUP_MIME_TYPE when the asset has no mimeType
			expect(attachment?.mimeType).toBe("application/x-sqlite3");
		});
	});

	describe("saveAttachment / getAttachmentMetadata / deleteAttachment", () => {
		it("saves and reads back attachment metadata", async () => {
			await saveAttachment(database, "NOTE", "note-1", {
				fileName: "a.png",
				mimeType: "image/png",
				sizeBytes: 3,
				content: new Uint8Array([1, 2, 3]),
			});

			const metadata = await getAttachmentMetadata(
				database,
				"NOTE",
				"note-1",
			);
			expect(metadata?.fileName).toBe("a.png");
		});

		it("throws ATTACHMENT_TOO_LARGE without touching the database", async () => {
			await expect(
				saveAttachment(database, "NOTE", "note-1", {
					fileName: "big.bin",
					mimeType: "application/octet-stream",
					sizeBytes: TWO_MB + 1,
					content: new Uint8Array(),
				}),
			).rejects.toMatchObject({ code: "ATTACHMENT_TOO_LARGE" });
			expect(
				await getAttachmentMetadata(database, "NOTE", "note-1"),
			).toBeNull();
		});

		it("deletes an attachment", async () => {
			await saveAttachment(database, "NOTE", "note-1", {
				fileName: "a.png",
				mimeType: "image/png",
				sizeBytes: 1,
				content: new Uint8Array([1]),
			});

			await deleteAttachment(database, "NOTE", "note-1");

			expect(
				await getAttachmentMetadata(database, "NOTE", "note-1"),
			).toBeNull();
		});
	});

	describe("openAttachment", () => {
		it("throws ATTACHMENT_NOT_FOUND when there is no stored content", async () => {
			await expect(
				openAttachment(database, {
					id: "attachment-1",
					ownerType: "NOTE",
					ownerId: "missing-note",
					fileName: "a.png",
					mimeType: "image/png",
					sizeBytes: 1,
					createdAt: 0,
					updatedAt: 0,
				}),
			).rejects.toMatchObject({ code: "ATTACHMENT_NOT_FOUND" });
		});

		it("throws SHARING_UNAVAILABLE when sharing is unavailable on the device", async () => {
			await saveAttachment(database, "NOTE", "note-1", {
				fileName: "a.png",
				mimeType: "image/png",
				sizeBytes: 1,
				content: new Uint8Array([1]),
			});
			const metadata = await getAttachmentMetadata(
				database,
				"NOTE",
				"note-1",
			);
			if (!metadata) {
				throw new Error("Expected attachment metadata to exist.");
			}
			FileMock.mockImplementation(
				mockFileImplementation({
					uri: "mock://cache/output",
					create: vi.fn(),
					write: vi.fn(),
				}),
			);
			isAvailableAsyncMock.mockResolvedValue(false);

			await expect(
				openAttachment(database, metadata),
			).rejects.toMatchObject({ code: "SHARING_UNAVAILABLE" });
		});

		it("writes the file and shares it when available", async () => {
			await saveAttachment(database, "NOTE", "note-1", {
				fileName: "a.png",
				mimeType: "image/png",
				sizeBytes: 1,
				content: new Uint8Array([1]),
			});
			const metadata = await getAttachmentMetadata(
				database,
				"NOTE",
				"note-1",
			);
			if (!metadata) {
				throw new Error("Expected attachment metadata to exist.");
			}
			const createMock = vi.fn();
			const writeMock = vi.fn();
			FileMock.mockImplementation(
				mockFileImplementation({
					uri: "mock://cache/output",
					create: createMock,
					write: writeMock,
				}),
			);
			isAvailableAsyncMock.mockResolvedValue(true);
			shareAsyncMock.mockResolvedValue(undefined);

			await openAttachment(database, metadata);

			expect(createMock).toHaveBeenCalledWith({
				overwrite: true,
				intermediates: true,
			});
			expect(writeMock).toHaveBeenCalled();
			expect(shareAsyncMock).toHaveBeenCalledWith("mock://cache/output", {
				mimeType: "image/png",
				dialogTitle: "a.png",
			});
		});
	});
});
