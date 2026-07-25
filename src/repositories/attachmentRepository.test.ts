import attachmentRepository from "@/repositories/attachmentRepository";

import { beforeEach, describe, expect, it } from "vitest";

import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	deleteAttachmentRow,
	getAttachmentContentRow,
	getAttachmentMetadataRow,
	upsertAttachmentRow,
} = attachmentRepository;

const NOW = 1_780_000_000_000;

describe("attachmentRepository", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	it("returns null metadata/content when nothing is attached", async () => {
		expect(
			await getAttachmentMetadataRow(database, "NOTE", "missing-note"),
		).toBeNull();
		expect(
			await getAttachmentContentRow(database, "NOTE", "missing-note"),
		).toBeNull();
	});

	it("stores and retrieves attachment metadata and content", async () => {
		const content = new Uint8Array([1, 2, 3, 4, 5]);
		await upsertAttachmentRow(
			database,
			"attachment-1",
			"NOTE",
			"note-1",
			{
				fileName: "photo.jpg",
				mimeType: "image/jpeg",
				sizeBytes: content.length,
				content,
			},
			NOW,
		);

		const metadata = await getAttachmentMetadataRow(
			database,
			"NOTE",
			"note-1",
		);
		const storedContent = await getAttachmentContentRow(
			database,
			"NOTE",
			"note-1",
		);

		expect(metadata).toMatchObject({
			id: "attachment-1",
			ownerType: "NOTE",
			ownerId: "note-1",
			fileName: "photo.jpg",
			mimeType: "image/jpeg",
			sizeBytes: 5,
		});
		expect(Array.from(storedContent ?? [])).toEqual([1, 2, 3, 4, 5]);
	});

	it("replaces an existing attachment's content for the same owner but keeps its original id (unique owner_type/owner_id)", async () => {
		await upsertAttachmentRow(
			database,
			"attachment-1",
			"TODO",
			"todo-1",
			{
				fileName: "first.png",
				mimeType: "image/png",
				sizeBytes: 3,
				content: new Uint8Array([1, 1, 1]),
			},
			NOW,
		);

		await upsertAttachmentRow(
			database,
			"attachment-2",
			"TODO",
			"todo-1",
			{
				fileName: "second.png",
				mimeType: "image/png",
				sizeBytes: 2,
				content: new Uint8Array([2, 2]),
			},
			NOW + 1,
		);

		const metadata = await getAttachmentMetadataRow(
			database,
			"TODO",
			"todo-1",
		);
		// The id/created_at columns are intentionally excluded from the
		// ON CONFLICT DO UPDATE clause, so the original id is preserved.
		expect(metadata?.id).toBe("attachment-1");
		expect(metadata?.fileName).toBe("second.png");
		expect(metadata?.updatedAt).toBe(NOW + 1);
	});

	it("keeps attachments for different owner types/ids independent", async () => {
		await upsertAttachmentRow(
			database,
			"attachment-card",
			"CARD",
			"card-1",
			{
				fileName: "card.png",
				mimeType: "image/png",
				sizeBytes: 1,
				content: new Uint8Array([9]),
			},
			NOW,
		);
		await upsertAttachmentRow(
			database,
			"attachment-identity",
			"IDENTITY",
			"card-1",
			{
				fileName: "identity.png",
				mimeType: "image/png",
				sizeBytes: 1,
				content: new Uint8Array([8]),
			},
			NOW,
		);

		expect(
			(await getAttachmentMetadataRow(database, "CARD", "card-1"))
				?.fileName,
		).toBe("card.png");
		expect(
			(await getAttachmentMetadataRow(database, "IDENTITY", "card-1"))
				?.fileName,
		).toBe("identity.png");
	});

	it("deletes an attachment", async () => {
		await upsertAttachmentRow(
			database,
			"attachment-delete",
			"CARD",
			"card-delete",
			{
				fileName: "a.png",
				mimeType: "image/png",
				sizeBytes: 1,
				content: new Uint8Array([1]),
			},
			NOW,
		);

		await deleteAttachmentRow(database, "CARD", "card-delete");

		expect(
			await getAttachmentMetadataRow(database, "CARD", "card-delete"),
		).toBeNull();
	});

	it("rejects an attachment larger than the 2MB schema limit", async () => {
		const oversized = new Uint8Array(1);
		await expect(
			upsertAttachmentRow(
				database,
				"attachment-oversized",
				"NOTE",
				"note-oversized",
				{
					fileName: "big.bin",
					mimeType: "application/octet-stream",
					sizeBytes: 2 * 1024 * 1024 + 1,
					content: oversized,
				},
				NOW,
			),
		).rejects.toThrow(/CHECK constraint failed/);
	});
});
