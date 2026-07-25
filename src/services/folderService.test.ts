import folderService from "@/services/folderService";

import { beforeEach, describe, expect, it } from "vitest";

import contentRepository from "@/repositories/contentRepository";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const { createFolder, deleteFolder, getFolders, renameFolder } = folderService;
const { upsertNoteRow } = contentRepository;

const NOW = 1_780_000_000_000;

describe("folderService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("createFolder", () => {
		it("creates a NOTE folder", async () => {
			const id = await createFolder(database, "Ideas", "NOTE");

			const folders = await getFolders(database, "NOTE");
			expect(folders).toEqual([
				expect.objectContaining({ id, name: "Ideas", type: "NOTE" }),
			]);
		});

		it("creates a TODO folder independently from NOTE folders", async () => {
			await createFolder(database, "Shared name", "NOTE");
			await createFolder(database, "Shared name", "TODO");

			expect(await getFolders(database, "NOTE")).toHaveLength(1);
			expect(await getFolders(database, "TODO")).toHaveLength(1);
		});

		it("throws FOLDER_NAME_REQUIRED for a blank name", async () => {
			await expect(
				createFolder(database, "   ", "NOTE"),
			).rejects.toMatchObject({ code: "FOLDER_NAME_REQUIRED" });
		});

		it("trims the folder name", async () => {
			const id = await createFolder(database, "  Work  ", "TODO");
			const [folder] = await getFolders(database, "TODO");
			expect(folder?.id).toBe(id);
			expect(folder?.name).toBe("Work");
		});
	});

	describe("renameFolder", () => {
		it("renames a NOTE folder found by id", async () => {
			const id = await createFolder(database, "Old", "NOTE");

			await renameFolder(database, id, "New");

			const [folder] = await getFolders(database, "NOTE");
			expect(folder?.name).toBe("New");
		});

		it("renames a TODO folder found by id (searches across both types)", async () => {
			const id = await createFolder(database, "Old", "TODO");

			await renameFolder(database, id, "New");

			const [folder] = await getFolders(database, "TODO");
			expect(folder?.name).toBe("New");
		});

		it("throws FOLDER_NAME_REQUIRED for a blank new name", async () => {
			const id = await createFolder(database, "Old", "NOTE");
			await expect(
				renameFolder(database, id, "   "),
			).rejects.toMatchObject({ code: "FOLDER_NAME_REQUIRED" });
		});

		it("throws FOLDER_NOT_FOUND for an unknown id", async () => {
			await expect(
				renameFolder(database, "missing-id", "New"),
			).rejects.toMatchObject({ code: "FOLDER_NOT_FOUND" });
		});
	});

	describe("deleteFolder", () => {
		it("deletes an empty folder", async () => {
			const id = await createFolder(database, "Empty", "NOTE");

			await deleteFolder(database, id);

			expect(await getFolders(database, "NOTE")).toEqual([]);
		});

		it("maps a foreign-key violation to FOLDER_IN_USE", async () => {
			const id = await createFolder(database, "Has note", "NOTE");
			await upsertNoteRow(database, {
				id: "note-1",
				folderId: id,
				folderName: null,
				title: "Title",
				content: "",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			await expect(deleteFolder(database, id)).rejects.toMatchObject({
				code: "FOLDER_IN_USE",
			});
		});

		it("rethrows an unrelated database error unchanged (not misclassified as FOLDER_IN_USE)", async () => {
			const id = await createFolder(database, "Empty", "NOTE");
			await database.closeAsync();

			const rejection = await deleteFolder(database, id).then(
				() => null,
				(error: unknown) => error,
			);

			expect(rejection).not.toMatchObject({ code: "FOLDER_IN_USE" });
			expect((rejection as Error).message).not.toContain("FOREIGN KEY");
		});
	});
});
