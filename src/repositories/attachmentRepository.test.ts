import attachmentRepository from "@/repositories/attachmentRepository";

import { describe, expect, it, vi } from "vitest";

const {
	deleteAttachmentRow,
	getAttachmentContentRow,
	getAttachmentMetadataRow,
	upsertAttachmentRow,
} = attachmentRepository;

describe("attachmentRepository", () => {
	it("gets metadata and content rows", async () => {
		const database = {
			getFirstAsync: vi
				.fn()
				.mockResolvedValueOnce({ id: "a1", fileName: "doc.pdf" })
				.mockResolvedValueOnce({ content: new Uint8Array([1, 2]) })
				.mockResolvedValueOnce(null),
		} as any;

		expect(await getAttachmentMetadataRow(database, "NOTE", "n1")).toEqual({
			id: "a1",
			fileName: "doc.pdf",
		});
		expect(await getAttachmentContentRow(database, "NOTE", "n1")).toEqual(
			new Uint8Array([1, 2]),
		);
		expect(await getAttachmentContentRow(database, "NOTE", "n2")).toBeNull();
	});

	it("upserts and deletes attachment rows", async () => {
		const database = { runAsync: vi.fn(async () => {}) } as any;
		await upsertAttachmentRow(
			database,
			"a1",
			"NOTE",
			"n1",
			{
				fileName: "doc.pdf",
				mimeType: "application/pdf",
				sizeBytes: 100,
				content: new Uint8Array([1]),
			},
			999,
		);
		expect(database.runAsync).toHaveBeenCalledWith(
			expect.stringContaining("INSERT INTO attachments"),
			"a1",
			"NOTE",
			"n1",
			"doc.pdf",
			"application/pdf",
			100,
			new Uint8Array([1]),
			999,
			999,
		);

		await deleteAttachmentRow(database, "NOTE", "n1");
		expect(database.runAsync).toHaveBeenCalledWith(
			"DELETE FROM attachments WHERE owner_type = ? AND owner_id = ?;",
			"NOTE",
			"n1",
		);
	});
});
