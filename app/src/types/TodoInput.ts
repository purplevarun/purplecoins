import type Todo from "@/types/Todo";

type TodoInput = Pick<Todo, "title" | "description" | "isDone"> &
	Readonly<{
		id?: string;
		folderId?: string;
		dueAt?: number;
	}>;

export type { TodoInput as default };
