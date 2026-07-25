import todoService from "@/services/todoService";

import { beforeEach, describe, expect, it } from "vitest";

import contentRepository from "@/repositories/contentRepository";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const { deleteTodo, getTodo, getTodos, saveTodo, toggleTodo } = todoService;
const { upsertFolderRow } = contentRepository;

describe("todoService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("saveTodo (create)", () => {
		it("creates a todo with trimmed title/description", async () => {
			const id = await saveTodo(database, {
				title: "  Ship feature  ",
				description: "  Details  ",
				isDone: false,
			});

			const todo = await getTodo(database, id);
			expect(todo?.title).toBe("Ship feature");
			expect(todo?.description).toBe("Details");
			expect(todo?.isDone).toBe(false);
			expect(todo?.dueAt).toBeNull();
			expect(todo?.folderId).toBeNull();
		});

		it("throws TODO_TITLE_REQUIRED for a blank title", async () => {
			await expect(
				saveTodo(database, {
					title: "   ",
					description: "",
					isDone: false,
				}),
			).rejects.toMatchObject({ code: "TODO_TITLE_REQUIRED" });
		});

		it("stores an optional dueAt and folderId", async () => {
			await upsertFolderRow(database, {
				id: "folder-1",
				name: "Work",
				type: "TODO",
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			const id = await saveTodo(database, {
				title: "Task",
				description: "",
				folderId: "folder-1",
				dueAt: 123456,
				isDone: false,
			});

			const todo = await getTodo(database, id);
			expect(todo?.dueAt).toBe(123456);
			expect(todo?.folderId).toBe("folder-1");
		});
	});

	describe("saveTodo (update)", () => {
		it("preserves createdAt and hasAttachment when updating", async () => {
			const id = await saveTodo(database, {
				title: "Task",
				description: "",
				isDone: false,
			});
			const original = await getTodo(database, id);

			await saveTodo(database, {
				id,
				title: "Updated task",
				description: "",
				isDone: false,
			});

			const updated = await getTodo(database, id);
			expect(updated?.title).toBe("Updated task");
			expect(updated?.createdAt).toBe(original?.createdAt);
		});
	});

	describe("toggleTodo", () => {
		it("flips isDone from false to true while preserving other fields", async () => {
			const id = await saveTodo(database, {
				title: "Task",
				description: "Notes",
				dueAt: 5000,
				isDone: false,
			});

			await toggleTodo(database, id);

			const todo = await getTodo(database, id);
			expect(todo?.isDone).toBe(true);
			expect(todo?.title).toBe("Task");
			expect(todo?.description).toBe("Notes");
			expect(todo?.dueAt).toBe(5000);
		});

		it("flips isDone from true back to false", async () => {
			const id = await saveTodo(database, {
				title: "Task",
				description: "",
				isDone: true,
			});

			await toggleTodo(database, id);

			expect((await getTodo(database, id))?.isDone).toBe(false);
		});

		it("throws TODO_NOT_FOUND for a missing todo", async () => {
			await expect(
				toggleTodo(database, "missing-id"),
			).rejects.toMatchObject({ code: "TODO_NOT_FOUND" });
		});
	});

	describe("getTodos / deleteTodo", () => {
		it("lists todos and coerces isDone/hasAttachment to booleans", async () => {
			await saveTodo(database, {
				title: "A",
				description: "",
				isDone: false,
			});

			const todos = await getTodos(database);
			expect(todos).toHaveLength(1);
			expect(todos[0]?.isDone).toBe(false);
			expect(todos[0]?.hasAttachment).toBe(false);
		});

		it("returns null for a missing todo", async () => {
			expect(await getTodo(database, "missing")).toBeNull();
		});

		it("deletes a todo", async () => {
			const id = await saveTodo(database, {
				title: "A",
				description: "",
				isDone: false,
			});

			await deleteTodo(database, id);

			expect(await getTodo(database, id)).toBeNull();
		});
	});
});
