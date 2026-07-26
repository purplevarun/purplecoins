import todoReminderService from "@/services/todoReminderService";

import { describe, expect, it } from "vitest";

import type Todo from "@/types/Todo";
import type TodoReminderSettings from "@/types/TodoReminderSettings";

const { buildTodoReminderSchedule } = todoReminderService;

const BASE_TODO: Todo = {
	id: "todo-1",
	folderId: null,
	folderName: null,
	title: "Pay rent",
	description: "",
	isDone: false,
	dueAt: new Date(2026, 6, 30, 15, 0, 0, 0).getTime(),
	createdAt: 0,
	updatedAt: 0,
	hasAttachment: false,
};

const DEFAULT_SETTINGS: TodoReminderSettings = {
	enabled: true,
	daysBeforeDue: 2,
	repeatHours: 12,
};

describe("todoReminderService", () => {
	it("builds a repeating schedule from the configured start day until the due date", () => {
		const now = new Date(2026, 6, 28, 8, 0, 0, 0).getTime();

		const schedule = buildTodoReminderSchedule(
			[BASE_TODO],
			DEFAULT_SETTINGS,
			now,
		);

		expect(schedule.map((item) => item.triggerAt)).toEqual([
			new Date(2026, 6, 28, 9, 0, 0, 0).getTime(),
			new Date(2026, 6, 28, 21, 0, 0, 0).getTime(),
			new Date(2026, 6, 29, 9, 0, 0, 0).getTime(),
			new Date(2026, 6, 29, 21, 0, 0, 0).getTime(),
			new Date(2026, 6, 30, 9, 0, 0, 0).getTime(),
			new Date(2026, 6, 30, 21, 0, 0, 0).getTime(),
		]);
		expect(schedule[0]?.body).toBe("Pay rent is due on 30 Jul 2026.");
	});

	it("skips completed todos, todos without due dates and overdue todos", () => {
		const now = new Date(2026, 6, 28, 8, 0, 0, 0).getTime();
		const overdueTodo: Todo = {
			...BASE_TODO,
			id: "todo-overdue",
			dueAt: new Date(2026, 6, 20, 10, 0, 0, 0).getTime(),
		};
		const completedTodo: Todo = {
			...BASE_TODO,
			id: "todo-done",
			isDone: true,
		};
		const unscheduledTodo: Todo = {
			...BASE_TODO,
			id: "todo-no-date",
			dueAt: null,
		};

		expect(
			buildTodoReminderSchedule(
				[overdueTodo, completedTodo, unscheduledTodo],
				DEFAULT_SETTINGS,
				now,
			),
		).toEqual([]);
	});

	it("starts from the next valid interval when the reminder window has already begun", () => {
		const now = new Date(2026, 6, 28, 16, 0, 0, 0).getTime();

		const schedule = buildTodoReminderSchedule(
			[BASE_TODO],
			DEFAULT_SETTINGS,
			now,
		);

		expect(schedule[0]?.triggerAt).toBe(
			new Date(2026, 6, 28, 21, 0, 0, 0).getTime(),
		);
	});
});
