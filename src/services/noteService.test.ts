import noteService from "@/services/noteService";

import { beforeEach, describe, expect, it } from "vitest";

import contentRepository from "@/repositories/contentRepository";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const { deleteNote, getNote, getNotes, saveNote } = noteService;
const { upsertFolderRow } = contentRepository;

describe("noteService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("saveNote (create)", () => {
		it("creates a note with trimmed title/content", async () => {
			const id = await saveNote(
				database,
				undefined,
				"  Grocery list  ",
				"  Milk, eggs  ",
				undefined,
			);

			const note = await getNote(database, id);
			expect(note?.title).toBe("Grocery list");
			expect(note?.content).toBe("Milk, eggs");
			expect(note?.folderId).toBeNull();
			expect(note?.hasAttachment).toBe(false);
		});

		it("throws NOTE_TITLE_REQUIRED for a blank title", async () => {
			await expect(
				saveNote(database, undefined, "   ", "content", undefined),
			).rejects.toMatchObject({ code: "NOTE_TITLE_REQUIRED" });
		});

		it("associates the note with a folder when provided", async () => {
			await upsertFolderRow(database, {
				id: "folder-1",
				name: "Ideas",
				type: "NOTE",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			const id = await saveNote(
				database,
				undefined,
				"Title",
				"",
				"folder-1",
			);
			expect((await getNote(database, id))?.folderId).toBe("folder-1");
		});
	});

	describe("saveNote (update)", () => {
		it("preserves createdAt and hasAttachment when updating", async () => {
			const id = await saveNote(
				database,
				undefined,
				"Title",
				"Body",
				undefined,
			);
			const original = await getNote(database, id);

			await saveNote(database, id, "New title", "New body", undefined);

			const updated = await getNote(database, id);
			expect(updated?.title).toBe("New title");
			expect(updated?.createdAt).toBe(original?.createdAt);
			expect(updated?.hasAttachment).toBe(false);
		});
	});

	describe("getNotes / deleteNote", () => {
		it("lists notes and coerces hasAttachment to a boolean", async () => {
			await saveNote(database, undefined, "A", "", undefined);
			const notes = await getNotes(database);
			expect(notes).toHaveLength(1);
			expect(notes[0]?.hasAttachment).toBe(false);
		});

		it("returns null for a missing note", async () => {
			expect(await getNote(database, "missing")).toBeNull();
		});

		it("deletes a note", async () => {
			const id = await saveNote(database, undefined, "A", "", undefined);
			await deleteNote(database, id);
			expect(await getNote(database, id)).toBeNull();
		});
	});
});
