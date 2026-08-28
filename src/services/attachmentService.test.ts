import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	getDocumentAsync: vi.fn(async () => ({ canceled: true })),
	deleteAttachmentRow: vi.fn(async () => {}),
	getAttachmentContentRow: vi.fn(async () => null),
	getAttachmentMetadataRow: vi.fn(async () => null),
	upsertAttachmentRow: vi.fn(async () => {}),
	createId: vi.fn(() => "attachment-id"),
	isAvailableAsync: vi.fn(async () => true),
	shareAsync: vi.fn(async () => {}),
	fileBytes: vi.fn(async () => new Uint8Array([1, 2, 3])),
	fileCreate: vi.fn(() => {}),
	fileWrite: vi.fn(() => {}),
}));

vi.mock("@/constants/appConstants", () => ({
	default: {
		ATTACHMENT_MAX_BYTES: 2 * 1024 * 1024,
		BACKUP_MIME_TYPE: "application/octet-stream",
	},
}));

vi.mock("expo-document-picker", () => ({
	getDocumentAsync: mocks.getDocumentAsync,
}));

vi.mock("@/repositories/attachmentRepository", () => ({
	default: {
		deleteAttachmentRow: mocks.deleteAttachmentRow,
		getAttachmentContentRow: mocks.getAttachmentContentRow,
		getAttachmentMetadataRow: mocks.getAttachmentMetadataRow,
		upsertAttachmentRow: mocks.upsertAttachmentRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

vi.mock("expo-sharing", () => ({
	isAvailableAsync: mocks.isAvailableAsync,
	shareAsync: mocks.shareAsync,
}));

vi.mock("expo-file-system", () => {
	class MockFile {
		uri: string;
		size: number;

		constructor(baseOrUri: string, name?: string) {
			if (name) {
				this.uri = `${baseOrUri}/${name}`;
				this.size = 123;
			} else {
				this.uri = baseOrUri;
				this.size = baseOrUri.includes("large")
					? 3 * 1024 * 1024
					: 1024;
			}
		}

		async bytes(): Promise<Uint8Array> {
			return mocks.fileBytes();
		}

		create(): void {
			mocks.fileCreate();
		}

		write(content: Uint8Array): void {
			mocks.fileWrite(content);
		}
	}

	return {
		File: MockFile,
		Paths: {
			cache: "cache-dir",
		},
	};
});

import attachmentService from "@/services/attachmentService";

const database = {} as any;

describe("attachmentService", () => {
	beforeEach(() => {
		Object.values(mocks).forEach((mockFn) => {
			if (typeof mockFn === "function" && "mockClear" in mockFn) {
				mockFn.mockClear();
			}
		});
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
	});

	it("returns null when picker is canceled", async () => {
		mocks.getDocumentAsync.mockResolvedValueOnce({ canceled: true });
		expect(await attachmentService.pickAttachment()).toBeNull();
	});

	it("throws when picker returns no asset", async () => {
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [],
		});
		await expect(
			attachmentService.pickAttachment(),
		).rejects.toMatchObject<AppError>({
			code: "ATTACHMENT_PICK_FAILED",
		});
	});

	it("throws when selected file is too large", async () => {
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [
				{
					uri: "file://large.pdf",
					name: "large.pdf",
					size: 3 * 1024 * 1024,
				},
			],
		});
		await expect(
			attachmentService.pickAttachment(),
		).rejects.toMatchObject<AppError>({
			code: "ATTACHMENT_TOO_LARGE",
		});
	});

	it("throws when selected file size is zero", async () => {
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [
				{
					uri: "file://empty.pdf",
					name: "empty.pdf",
					size: 0,
					mimeType: "application/pdf",
				},
			],
		});
		await expect(
			attachmentService.pickAttachment(),
		).rejects.toMatchObject<AppError>({
			code: "ATTACHMENT_TOO_LARGE",
		});
	});

	it("reads picked attachment bytes and defaults mime type", async () => {
		mocks.getDocumentAsync.mockResolvedValueOnce({
			canceled: false,
			assets: [
				{
					uri: "file://ok.pdf",
					name: "ok.pdf",
					size: 1000,
					mimeType: null,
				},
			],
		});

		const picked = await attachmentService.pickAttachment();
		expect(picked).toEqual({
			fileName: "ok.pdf",
			mimeType: "application/octet-stream",
			sizeBytes: 1000,
			content: new Uint8Array([1, 2, 3]),
		});
	});

	it("gets and saves and deletes attachment metadata", async () => {
		mocks.getAttachmentMetadataRow.mockResolvedValueOnce({ id: "a1" });
		expect(
			await attachmentService.getAttachmentMetadata(
				database,
				"NOTE",
				"n1",
			),
		).toEqual({
			id: "a1",
		});

		await expect(
			attachmentService.saveAttachment(database, "NOTE", "n1", {
				fileName: "x",
				mimeType: "application/pdf",
				sizeBytes: 3 * 1024 * 1024,
				content: new Uint8Array([1]),
			}),
		).rejects.toMatchObject<AppError>({ code: "ATTACHMENT_TOO_LARGE" });

		await attachmentService.saveAttachment(database, "NOTE", "n1", {
			fileName: "x",
			mimeType: "application/pdf",
			sizeBytes: 100,
			content: new Uint8Array([1]),
		});
		expect(mocks.upsertAttachmentRow).toHaveBeenCalledWith(
			database,
			"attachment-id",
			"NOTE",
			"n1",
			expect.objectContaining({ fileName: "x" }),
			new Date("2026-08-25T12:00:00.000Z").getTime(),
		);

		await attachmentService.deleteAttachment(database, "NOTE", "n1");
		expect(mocks.deleteAttachmentRow).toHaveBeenCalledWith(
			database,
			"NOTE",
			"n1",
		);
	});

	it("openAttachment handles missing content and unavailable sharing", async () => {
		const metadata = {
			id: "a1",
			ownerType: "NOTE",
			ownerId: "n1",
			fileName: "doc.pdf",
			mimeType: "application/pdf",
		};

		mocks.getAttachmentContentRow.mockResolvedValueOnce(null);
		await expect(
			attachmentService.openAttachment(database, metadata as any),
		).rejects.toMatchObject<AppError>({
			code: "ATTACHMENT_NOT_FOUND",
		});

		mocks.getAttachmentContentRow.mockResolvedValueOnce(
			new Uint8Array([9, 9]),
		);
		mocks.isAvailableAsync.mockResolvedValueOnce(false);
		await expect(
			attachmentService.openAttachment(database, metadata as any),
		).rejects.toMatchObject<AppError>({
			code: "SHARING_UNAVAILABLE",
		});
	});

	it("openAttachment writes file and shares when available", async () => {
		const metadata = {
			id: "a1",
			ownerType: "NOTE",
			ownerId: "n1",
			fileName: "doc.pdf",
			mimeType: "application/pdf",
		};
		mocks.getAttachmentContentRow.mockResolvedValueOnce(
			new Uint8Array([7, 8]),
		);
		mocks.isAvailableAsync.mockResolvedValueOnce(true);

		await attachmentService.openAttachment(database, metadata as any);

		expect(mocks.fileCreate).toHaveBeenCalledTimes(1);
		expect(mocks.fileWrite).toHaveBeenCalledWith(new Uint8Array([7, 8]));
		expect(mocks.shareAsync).toHaveBeenCalledWith(
			"cache-dir/a1-doc.pdf",
			expect.objectContaining({
				mimeType: "application/pdf",
				dialogTitle: "doc.pdf",
			}),
		);
	});
});
