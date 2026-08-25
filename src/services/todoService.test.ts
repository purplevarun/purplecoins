import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	return {
		deleteContentRow: vi.fn(async () => {}),
		getTodoRow: vi.fn(async () => null),
		getTodoRows: vi.fn(async () => []),
		upsertTodoRow: vi.fn(async () => {}),
		createId: vi.fn(() => "new-todo-id"),
	};
});

vi.mock("@/repositories/contentRepository", () => ({
	default: {
		deleteContentRow: mocks.deleteContentRow,
		getTodoRow: mocks.getTodoRow,
		getTodoRows: mocks.getTodoRows,
		upsertTodoRow: mocks.upsertTodoRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import todoService from "@/services/todoService";

const database = {} as any;

describe("todoService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		mocks.deleteContentRow.mockClear();
		mocks.getTodoRow.mockClear();
		mocks.getTodoRows.mockClear();
		mocks.upsertTodoRow.mockClear();
		mocks.createId.mockClear();
	});

	it("maps boolean-ish fields in getTodos", async () => {
		mocks.getTodoRows.mockResolvedValueOnce([
			{
				id: "t1",
				title: "A",
				description: "B",
				folderId: null,
				folderName: null,
				dueAt: null,
				isDone: 1,
				hasAttachment: 0,
				createdAt: 1,
				updatedAt: 1,
			},
		]);

		const todos = await todoService.getTodos(database);
		expect(todos[0]?.isDone).toBe(true);
		expect(todos[0]?.hasAttachment).toBe(false);
	});

	it("returns null for missing todo", async () => {
		mocks.getTodoRow.mockResolvedValueOnce(null);
		expect(await todoService.getTodo(database, "missing")).toBeNull();
	});

	it("maps boolean-ish fields in getTodo", async () => {
		mocks.getTodoRow.mockResolvedValueOnce({
			id: "t1",
			title: "A",
			description: "B",
			folderId: null,
			folderName: null,
			dueAt: null,
			isDone: 0,
			hasAttachment: 1,
			createdAt: 1,
			updatedAt: 1,
		});

		const todo = await todoService.getTodo(database, "t1");
		expect(todo?.isDone).toBe(false);
		expect(todo?.hasAttachment).toBe(true);
	});

	it("throws when title is empty", async () => {
		await expect(
			todoService.saveTodo(database, {
				title: "   ",
				description: "desc",
				isDone: false,
			}),
		).rejects.toMatchObject<AppError>({
			code: "TODO_TITLE_REQUIRED",
		});
	});

	it("creates new todo with normalized values", async () => {
		const id = await todoService.saveTodo(database, {
			title: "  Buy milk  ",
			description: "  low fat  ",
			folderId: undefined,
			dueAt: undefined,
			isDone: false,
		});

		expect(id).toBe("new-todo-id");
		expect(mocks.createId).toHaveBeenCalledTimes(1);
		expect(mocks.upsertTodoRow).toHaveBeenCalledWith(database, {
			id: "new-todo-id",
			folderId: null,
			folderName: null,
			title: "Buy milk",
			description: "low fat",
			isDone: false,
			dueAt: null,
			createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			updatedAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			hasAttachment: false,
		});
	});

	it("updates existing todo and keeps createdAt and hasAttachment", async () => {
		mocks.getTodoRow.mockResolvedValueOnce({
			id: "t1",
			title: "Old",
			description: "Old",
			folderId: "f1",
			folderName: "Folder",
			dueAt: 10,
			isDone: false,
			hasAttachment: true,
			createdAt: 123,
			updatedAt: 456,
		});

		const id = await todoService.saveTodo(database, {
			id: "t1",
			title: "  New  ",
			description: "  Desc  ",
			folderId: "f2",
			dueAt: 789,
			isDone: true,
		});

		expect(id).toBe("t1");
		expect(mocks.createId).not.toHaveBeenCalled();
		expect(mocks.upsertTodoRow).toHaveBeenCalledWith(database, {
			id: "t1",
			folderId: "f2",
			folderName: null,
			title: "New",
			description: "Desc",
			isDone: true,
			dueAt: 789,
			createdAt: 123,
			updatedAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			hasAttachment: true,
		});
	});

	it("toggleTodo throws when todo is missing", async () => {
		mocks.getTodoRow.mockResolvedValueOnce(null);
		await expect(todoService.toggleTodo(database, "missing")).rejects.toMatchObject<AppError>({
			code: "TODO_NOT_FOUND",
		});
	});

	it("toggleTodo flips done state and persists", async () => {
		mocks.getTodoRow.mockResolvedValueOnce({
			id: "t1",
			title: "A",
			description: "B",
			folderId: "f1",
			folderName: "F",
			dueAt: 500,
			isDone: 0,
			hasAttachment: 0,
			createdAt: 100,
			updatedAt: 101,
		});
		mocks.getTodoRow.mockResolvedValueOnce({
			id: "t1",
			title: "A",
			description: "B",
			folderId: "f1",
			folderName: "F",
			dueAt: 500,
			isDone: 0,
			hasAttachment: 0,
			createdAt: 100,
			updatedAt: 101,
		});

		await todoService.toggleTodo(database, "t1");

		expect(mocks.upsertTodoRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "t1",
				isDone: true,
				title: "A",
			}),
		);
	});

	it("deletes todo through content repository", async () => {
		await todoService.deleteTodo(database, "t1");
		expect(mocks.deleteContentRow).toHaveBeenCalledWith(
			database,
			"todos",
			"TODO",
			"t1",
		);
	});
});
