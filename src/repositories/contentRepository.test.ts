import contentRepository from "@/repositories/contentRepository";

import { beforeEach, describe, expect, it } from "vitest";

import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	deleteContentRow,
	deleteFolderRow,
	getCardRow,
	getCardRows,
	getFolderRows,
	getIdentityRow,
	getIdentityRows,
	getNoteRow,
	getNoteRows,
	getPasswordRow,
	getPasswordRows,
	getTodoRow,
	getTodoRows,
	upsertCardRow,
	upsertFolderRow,
	upsertIdentityRow,
	upsertNoteRow,
	upsertPasswordRow,
	upsertTodoRow,
} = contentRepository;

const NOW = 1_780_000_000_000;

describe("contentRepository", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("folders", () => {
		it("creates and lists folders scoped by type, ordered by name", async () => {
			await upsertFolderRow(database, {
				id: "folder-notes-b",
				name: "Beta",
				type: "NOTE",
				createdAt: NOW,
				updatedAt: NOW,
			});
			await upsertFolderRow(database, {
				id: "folder-notes-a",
				name: "Alpha",
				type: "NOTE",
				createdAt: NOW,
				updatedAt: NOW,
			});
			await upsertFolderRow(database, {
				id: "folder-todos",
				name: "Todo folder",
				type: "TODO",
				createdAt: NOW,
				updatedAt: NOW,
			});

			const noteFolders = await getFolderRows(database, "NOTE");
			const todoFolders = await getFolderRows(database, "TODO");

			expect(noteFolders.map((folder) => folder.name)).toEqual([
				"Alpha",
				"Beta",
			]);
			expect(todoFolders.map((folder) => folder.name)).toEqual([
				"Todo folder",
			]);
		});

		it("renames a folder via upsert conflict", async () => {
			await upsertFolderRow(database, {
				id: "folder-1",
				name: "Old",
				type: "NOTE",
				createdAt: NOW,
				updatedAt: NOW,
			});

			await upsertFolderRow(database, {
				id: "folder-1",
				name: "New",
				type: "NOTE",
				createdAt: NOW,
				updatedAt: NOW + 1,
			});

			const folders = await getFolderRows(database, "NOTE");
			expect(folders).toEqual([
				{
					id: "folder-1",
					name: "New",
					type: "NOTE",
					createdAt: NOW,
					updatedAt: NOW + 1,
				},
			]);
		});

		it("deletes an empty folder", async () => {
			await upsertFolderRow(database, {
				id: "folder-empty",
				name: "Empty",
				type: "NOTE",
				createdAt: NOW,
				updatedAt: NOW,
			});

			await deleteFolderRow(database, "folder-empty");

			expect(await getFolderRows(database, "NOTE")).toEqual([]);
		});

		it("throws a foreign-key error deleting a folder containing a note", async () => {
			await upsertFolderRow(database, {
				id: "folder-with-note",
				name: "Has note",
				type: "NOTE",
				createdAt: NOW,
				updatedAt: NOW,
			});
			await upsertNoteRow(database, {
				id: "note-in-folder",
				folderId: "folder-with-note",
				folderName: null,
				title: "Title",
				content: "Content",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			await expect(
				deleteFolderRow(database, "folder-with-note"),
			).rejects.toThrow(/FOREIGN KEY/);
		});
	});

	describe("notes", () => {
		it("creates and retrieves a note joined with its folder name", async () => {
			await upsertFolderRow(database, {
				id: "folder-1",
				name: "Ideas",
				type: "NOTE",
				createdAt: NOW,
				updatedAt: NOW,
			});
			await upsertNoteRow(database, {
				id: "note-1",
				folderId: "folder-1",
				folderName: null,
				title: "Grocery list",
				content: "Milk, eggs",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			const row = await getNoteRow(database, "note-1");
			const rows = await getNoteRows(database);

			expect(row?.folderName).toBe("Ideas");
			expect(row?.hasAttachment).toBe(0);
			expect(rows).toHaveLength(1);
		});

		it("supports notes without a folder", async () => {
			await upsertNoteRow(database, {
				id: "note-no-folder",
				folderId: null,
				folderName: null,
				title: "Loose note",
				content: "",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			const row = await getNoteRow(database, "note-no-folder");
			expect(row?.folderId).toBeNull();
			expect(row?.folderName).toBeNull();
		});

		it("updates a note in place via upsert", async () => {
			await upsertNoteRow(database, {
				id: "note-update",
				folderId: null,
				folderName: null,
				title: "Old title",
				content: "Old content",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			await upsertNoteRow(database, {
				id: "note-update",
				folderId: null,
				folderName: null,
				title: "New title",
				content: "New content",
				createdAt: NOW,
				updatedAt: NOW + 1,
				hasAttachment: false,
			});

			const row = await getNoteRow(database, "note-update");
			expect(row?.title).toBe("New title");
			expect(row?.content).toBe("New content");
		});

		it("orders notes by most recently updated first", async () => {
			await upsertNoteRow(database, {
				id: "note-a",
				folderId: null,
				folderName: null,
				title: "A",
				content: "",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});
			await upsertNoteRow(database, {
				id: "note-b",
				folderId: null,
				folderName: null,
				title: "B",
				content: "",
				createdAt: NOW,
				updatedAt: NOW + 100,
				hasAttachment: false,
			});

			const rows = await getNoteRows(database);
			expect(rows.map((row) => row.id)).toEqual(["note-b", "note-a"]);
		});

		it("deletes a note via the shared deleteContentRow helper", async () => {
			await upsertNoteRow(database, {
				id: "note-delete",
				folderId: null,
				folderName: null,
				title: "Delete me",
				content: "",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			await deleteContentRow(database, "notes", "NOTE", "note-delete");

			expect(await getNoteRow(database, "note-delete")).toBeNull();
		});
	});

	describe("todos", () => {
		it("creates and retrieves a todo joined with its folder name", async () => {
			await upsertFolderRow(database, {
				id: "folder-work",
				name: "Work",
				type: "TODO",
				createdAt: NOW,
				updatedAt: NOW,
			});
			await upsertTodoRow(database, {
				id: "todo-1",
				folderId: "folder-work",
				folderName: null,
				title: "Ship feature",
				description: "",
				isDone: false,
				dueAt: NOW + 1000,
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			const row = await getTodoRow(database, "todo-1");
			expect(row?.folderName).toBe("Work");
			expect(row?.isDone).toBe(0);
		});

		it("orders todos: not-done before done, then by due date, then recency", async () => {
			await upsertTodoRow(database, {
				id: "todo-done",
				folderId: null,
				folderName: null,
				title: "Done task",
				description: "",
				isDone: true,
				dueAt: null,
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});
			await upsertTodoRow(database, {
				id: "todo-due-later",
				folderId: null,
				folderName: null,
				title: "Due later",
				description: "",
				isDone: false,
				dueAt: NOW + 5000,
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});
			await upsertTodoRow(database, {
				id: "todo-due-soon",
				folderId: null,
				folderName: null,
				title: "Due soon",
				description: "",
				isDone: false,
				dueAt: NOW + 1000,
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});
			await upsertTodoRow(database, {
				id: "todo-no-due",
				folderId: null,
				folderName: null,
				title: "No due date",
				description: "",
				isDone: false,
				dueAt: null,
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			const rows = await getTodoRows(database);

			expect(rows.map((row) => row.id)).toEqual([
				"todo-due-soon",
				"todo-due-later",
				"todo-no-due",
				"todo-done",
			]);
		});

		it("toggles isDone via upsert", async () => {
			await upsertTodoRow(database, {
				id: "todo-toggle",
				folderId: null,
				folderName: null,
				title: "Toggle",
				description: "",
				isDone: false,
				dueAt: null,
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			await upsertTodoRow(database, {
				id: "todo-toggle",
				folderId: null,
				folderName: null,
				title: "Toggle",
				description: "",
				isDone: true,
				dueAt: null,
				createdAt: NOW,
				updatedAt: NOW + 1,
				hasAttachment: false,
			});

			const row = await getTodoRow(database, "todo-toggle");
			expect(row?.isDone).toBe(1);
		});

		it("deletes a todo", async () => {
			await upsertTodoRow(database, {
				id: "todo-delete",
				folderId: null,
				folderName: null,
				title: "Delete me",
				description: "",
				isDone: false,
				dueAt: null,
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			await deleteContentRow(database, "todos", "TODO", "todo-delete");

			expect(await getTodoRow(database, "todo-delete")).toBeNull();
		});
	});

	describe("passwords", () => {
		it("creates, lists (ordered by title) and fetches a password entry", async () => {
			await upsertPasswordRow(database, {
				id: "password-b",
				title: "Bank",
				username: "user",
				password: "secret",
				website: "bank.com",
				notes: "",
				createdAt: NOW,
				updatedAt: NOW,
			});
			await upsertPasswordRow(database, {
				id: "password-a",
				title: "Amazon",
				username: "user2",
				password: "secret2",
				website: "",
				notes: "",
				createdAt: NOW,
				updatedAt: NOW,
			});

			const rows = await getPasswordRows(database);
			const row = await getPasswordRow(database, "password-b");

			expect(rows.map((entry) => entry.title)).toEqual([
				"Amazon",
				"Bank",
			]);
			expect(row?.username).toBe("user");
		});

		it("deletes a password entry (no attachment cascade)", async () => {
			await upsertPasswordRow(database, {
				id: "password-delete",
				title: "Delete me",
				username: "",
				password: "secret",
				website: "",
				notes: "",
				createdAt: NOW,
				updatedAt: NOW,
			});

			await deleteContentRow(
				database,
				"passwords",
				null,
				"password-delete",
			);

			expect(
				await getPasswordRow(database, "password-delete"),
			).toBeNull();
		});
	});

	describe("cards", () => {
		it("creates and retrieves a card with hasAttachment flag", async () => {
			await upsertCardRow(database, {
				id: "card-1",
				name: "Visa",
				cardType: "CREDIT_CARD",
				cardNumber: "4111111111111111",
				expiry: "12/30",
				cvv: "123",
				pin: "1234",
				network: "Visa",
				notes: "",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			const row = await getCardRow(database, "card-1");
			const rows = await getCardRows(database);

			expect(row?.cardType).toBe("CREDIT_CARD");
			expect(row?.hasAttachment).toBe(0);
			expect(rows).toHaveLength(1);
		});

		it("updates a card in place via upsert", async () => {
			await upsertCardRow(database, {
				id: "card-update",
				name: "Old name",
				cardType: "DEBIT_CARD",
				cardNumber: "1111",
				expiry: "",
				cvv: "",
				pin: "",
				network: "",
				notes: "",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			await upsertCardRow(database, {
				id: "card-update",
				name: "New name",
				cardType: "CREDIT_CARD",
				cardNumber: "2222",
				expiry: "01/29",
				cvv: "999",
				pin: "0000",
				network: "Mastercard",
				notes: "Updated",
				createdAt: NOW,
				updatedAt: NOW + 1,
				hasAttachment: false,
			});

			const row = await getCardRow(database, "card-update");
			expect(row?.name).toBe("New name");
			expect(row?.cardType).toBe("CREDIT_CARD");
			expect(row?.network).toBe("Mastercard");
		});
	});

	describe("identities", () => {
		it("creates and retrieves an identity entry", async () => {
			await upsertIdentityRow(database, {
				id: "identity-1",
				title: "Passport",
				idNumber: "X1234567",
				notes: "",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			const row = await getIdentityRow(database, "identity-1");
			const rows = await getIdentityRows(database);

			expect(row?.idNumber).toBe("X1234567");
			expect(rows).toHaveLength(1);
		});

		it("deletes an identity entry and its attachments together", async () => {
			await upsertIdentityRow(database, {
				id: "identity-delete",
				title: "Delete me",
				idNumber: "",
				notes: "",
				createdAt: NOW,
				updatedAt: NOW,
				hasAttachment: false,
			});

			await deleteContentRow(
				database,
				"identities",
				"IDENTITY",
				"identity-delete",
			);

			expect(
				await getIdentityRow(database, "identity-delete"),
			).toBeNull();
		});
	});
});
