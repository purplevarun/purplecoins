import AppError from "@/errors/AppError";
import contentRepository from "@/repositories/contentRepository";
import type Todo from "@/types/Todo";
import createId from "@/utils/id";
import type { SQLiteDatabase } from "expo-sqlite";

const { deleteContentRow, getTodoRow, getTodoRows, upsertTodoRow } =
	contentRepository;

const mapTodo = (todo: Todo): Todo => ({
	...todo,
	isDone: Boolean(todo.isDone),
	hasAttachment: Boolean(todo.hasAttachment),
});

const getTodos = async (database: SQLiteDatabase): Promise<readonly Todo[]> => {
	const todos = await getTodoRows(database);
	return todos.map(mapTodo);
};

const getTodo = async (
	database: SQLiteDatabase,
	id: string,
): Promise<Todo | null> => {
	const todo = await getTodoRow(database, id);
	return todo ? mapTodo(todo) : null;
};

const saveTodo = async (
	database: SQLiteDatabase,
	todo: Readonly<{
		id?: string;
		title: string;
		description: string;
		folderId?: string;
		dueAt?: number;
		isDone: boolean;
	}>,
): Promise<string> => {
	const normalizedTitle = todo.title.trim();
	if (!normalizedTitle) {
		throw new AppError("TODO_TITLE_REQUIRED", "Todo title is required.");
	}
	const now = Date.now();
	const existingTodo = todo.id ? await getTodoRow(database, todo.id) : null;
	const todoId = todo.id ?? createId();
	await upsertTodoRow(database, {
		id: todoId,
		folderId: todo.folderId ?? null,
		folderName: null,
		title: normalizedTitle,
		description: todo.description.trim(),
		isDone: todo.isDone,
		dueAt: todo.dueAt ?? null,
		createdAt: existingTodo?.createdAt ?? now,
		updatedAt: now,
		hasAttachment: existingTodo?.hasAttachment ?? false,
	});
	return todoId;
};

const toggleTodo = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	const todo = await getTodo(database, id);
	if (!todo) {
		throw new AppError("TODO_NOT_FOUND", "Todo no longer exists.");
	}
	await saveTodo(database, {
		id,
		title: todo.title,
		description: todo.description,
		folderId: todo.folderId ?? undefined,
		dueAt: todo.dueAt ?? undefined,
		isDone: !todo.isDone,
	});
};

const deleteTodo = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => deleteContentRow(database, "todos", "TODO", id);

const todoService = {
	deleteTodo,
	getTodo,
	getTodos,
	saveTodo,
	toggleTodo,
};

export default todoService;
