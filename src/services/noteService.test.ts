import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteContentRow: vi.fn(async () => {}),
	getNoteRow: vi.fn(async () => null),
	getNoteRows: vi.fn(async () => []),
	upsertNoteRow: vi.fn(async () => {}),
	createId: vi.fn(() => "note-id"),
}));

vi.mock("@/repositories/contentRepository", () => ({
	default: {
		deleteContentRow: mocks.deleteContentRow,
		getNoteRow: mocks.getNoteRow,
		getNoteRows: mocks.getNoteRows,
		upsertNoteRow: mocks.upsertNoteRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import noteService from "@/services/noteService";

const database = {} as any;

describe("noteService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("maps boolean-ish attachment values", async () => {
		mocks.getNoteRows.mockResolvedValueOnce([
			{ id: "n1", title: "A", content: "B", folderId: null, hasAttachment: 1 },
		]);
		mocks.getNoteRow.mockResolvedValueOnce({
			id: "n2",
			title: "A",
			content: "B",
			folderId: null,
			hasAttachment: 0,
		});
		mocks.getNoteRow.mockResolvedValueOnce(null);

		expect((await noteService.getNotes(database))[0]?.hasAttachment).toBe(true);
		expect((await noteService.getNote(database, "n2"))?.hasAttachment).toBe(false);
		expect(await noteService.getNote(database, "missing")).toBeNull();
	});

	it("validates and creates note", async () => {
		await expect(noteService.saveNote(database, undefined, "   ", "x", undefined)).rejects.toMatchObject<AppError>({
			code: "NOTE_TITLE_REQUIRED",
		});

		const id = await noteService.saveNote(
			database,
			undefined,
			"  Title  ",
			"  Content  ",
			undefined,
		);
		expect(id).toBe("note-id");
		expect(mocks.upsertNoteRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "note-id",
				title: "Title",
				content: "Content",
				folderId: null,
				createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
				hasAttachment: false,
			}),
		);
	});

	it("updates existing note preserving createdAt and hasAttachment", async () => {
		mocks.getNoteRow.mockResolvedValueOnce({
			id: "n1",
			title: "Old",
			content: "Old",
			folderId: "f1",
			hasAttachment: true,
			createdAt: 123,
			updatedAt: 456,
		});

		const id = await noteService.saveNote(
			database,
			"n1",
			"  New  ",
			"  Body  ",
			"f2",
		);
		expect(id).toBe("n1");
		expect(mocks.upsertNoteRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "n1",
				title: "New",
				content: "Body",
				folderId: "f2",
				createdAt: 123,
				hasAttachment: true,
			}),
		);
	});

	it("deletes note through content repository", async () => {
		await noteService.deleteNote(database, "n1");
		expect(mocks.deleteContentRow).toHaveBeenCalledWith(
			database,
			"notes",
			"NOTE",
			"n1",
		);
	});
});
