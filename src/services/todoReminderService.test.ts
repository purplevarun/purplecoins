import todoReminderService from "@/services/todoReminderService";

import { afterEach, describe, expect, it, vi } from "vitest";

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

	it("returns no reminders when the remaining time before due is shorter than the minimum lead time", () => {
		const todoDueToday: Todo = {
			...BASE_TODO,
			dueAt: new Date(2026, 6, 28, 12, 0, 0, 0).getTime(),
		};
		const now = new Date(2026, 6, 28, 23, 59, 30, 0).getTime();

		expect(
			buildTodoReminderSchedule(
				[todoDueToday],
				{ ...DEFAULT_SETTINGS, daysBeforeDue: 0 },
				now,
			),
		).toEqual([]);
	});

	it("returns no reminders when the next repeat interval would fall after the due date", () => {
		const startAt = new Date(2026, 6, 28, 9, 0, 0, 0).getTime();
		const todoDueToday: Todo = {
			...BASE_TODO,
			dueAt: new Date(2026, 6, 28, 12, 0, 0, 0).getTime(),
		};
		const now = startAt - 59_000;

		expect(
			buildTodoReminderSchedule(
				[todoDueToday],
				{ ...DEFAULT_SETTINGS, daysBeforeDue: 0, repeatHours: 20 },
				now,
			),
		).toEqual([]);
	});

	it("breaks ties between reminders scheduled at the same time by todo id", () => {
		const now = new Date(2026, 6, 28, 8, 0, 0, 0).getTime();
		const todoB: Todo = { ...BASE_TODO, id: "todo-b" };
		const todoA: Todo = { ...BASE_TODO, id: "todo-a" };

		const schedule = buildTodoReminderSchedule(
			[todoB, todoA],
			DEFAULT_SETTINGS,
			now,
		);

		expect(schedule[0]?.todoId).toBe("todo-a");
		expect(schedule[1]?.todoId).toBe("todo-b");
	});
});

describe("syncTodoReminders", () => {
	const database = {} as never;

	afterEach(() => {
		vi.resetModules();
		vi.doUnmock("expo-notifications");
		vi.doUnmock("react-native");
		vi.doUnmock("@/services/settingsService");
		vi.doUnmock("@/services/todoService");
	});

	const mockDependencies = (options: {
		settings?: TodoReminderSettings;
		todos?: readonly Todo[];
		platformOs?: string;
		permissions?: {
			granted: boolean;
			status?: string;
			canAskAgain?: boolean;
		};
		requestedGranted?: boolean;
		scheduled?: readonly {
			identifier: string;
			content: { data: Record<string, unknown> | null };
		}[];
	}): {
		setNotificationHandler: ReturnType<typeof vi.fn>;
		setNotificationChannelAsync: ReturnType<typeof vi.fn>;
		getAllScheduledNotificationsAsync: ReturnType<typeof vi.fn>;
		cancelScheduledNotificationAsync: ReturnType<typeof vi.fn>;
		getPermissionsAsync: ReturnType<typeof vi.fn>;
		requestPermissionsAsync: ReturnType<typeof vi.fn>;
		scheduleNotificationAsync: ReturnType<typeof vi.fn>;
		AndroidImportance: { HIGH: number };
	} => {
		const {
			settings = DEFAULT_SETTINGS,
			todos = [],
			platformOs = "android",
			permissions = { granted: true },
			requestedGranted = true,
			scheduled = [],
		} = options;

		const notificationsMock = {
			setNotificationHandler: vi.fn(),
			setNotificationChannelAsync: vi.fn().mockResolvedValue(undefined),
			getAllScheduledNotificationsAsync: vi
				.fn()
				.mockResolvedValue(scheduled),
			cancelScheduledNotificationAsync: vi
				.fn()
				.mockResolvedValue(undefined),
			getPermissionsAsync: vi.fn().mockResolvedValue(permissions),
			requestPermissionsAsync: vi
				.fn()
				.mockResolvedValue({ granted: requestedGranted }),
			scheduleNotificationAsync: vi.fn().mockResolvedValue("id"),
			AndroidImportance: { HIGH: 4 },
		};

		vi.doMock("expo-notifications", () => notificationsMock);
		vi.doMock("react-native", () => ({
			Platform: { OS: platformOs },
		}));
		vi.doMock("@/services/settingsService", () => ({
			default: {
				getTodoReminderSettings: vi.fn().mockResolvedValue(settings),
			},
		}));
		vi.doMock("@/services/todoService", () => ({
			default: { getTodos: vi.fn().mockResolvedValue(todos) },
		}));

		return notificationsMock;
	};

	it("reports unavailable when expo-notifications cannot be loaded", async () => {
		vi.doMock("expo-notifications", () => {
			throw new Error("module unavailable");
		});
		vi.doMock("@/services/settingsService", () => ({
			default: {
				getTodoReminderSettings: vi
					.fn()
					.mockResolvedValue(DEFAULT_SETTINGS),
			},
		}));
		vi.doMock("@/services/todoService", () => ({
			default: { getTodos: vi.fn().mockResolvedValue([]) },
		}));
		const { default: service } =
			await import("@/services/todoReminderService");

		const result = await service.syncTodoReminders(database);

		expect(result).toEqual({
			permissionState: "unavailable",
			scheduledCount: 0,
		});
	});

	it("reports disabled and clears existing reminders when reminders are turned off", async () => {
		const notifications = mockDependencies({
			settings: { ...DEFAULT_SETTINGS, enabled: false },
			scheduled: [
				{
					identifier: "existing-1",
					content: { data: { ownerType: "TODO_REMINDER" } },
				},
				{
					identifier: "existing-2",
					content: { data: { ownerType: "OTHER" } },
				},
			],
		});
		const { default: service } =
			await import("@/services/todoReminderService");

		const result = await service.syncTodoReminders(database);

		expect(result).toEqual({
			permissionState: "disabled",
			scheduledCount: 0,
		});
		expect(
			notifications.cancelScheduledNotificationAsync,
		).toHaveBeenCalledWith("existing-1");
		expect(
			notifications.cancelScheduledNotificationAsync,
		).not.toHaveBeenCalledWith("existing-2");
	});

	it("reports denied when notification permission is refused and cannot be re-requested", async () => {
		mockDependencies({
			permissions: {
				granted: false,
				status: "denied",
				canAskAgain: false,
			},
		});
		const { default: service } =
			await import("@/services/todoReminderService");

		const result = await service.syncTodoReminders(database);

		expect(result).toEqual({
			permissionState: "denied",
			scheduledCount: 0,
		});
	});

	it("requests permission when not yet granted and schedules reminders once granted", async () => {
		const now = new Date(2026, 6, 28, 8, 0, 0, 0).getTime();
		vi.useFakeTimers();
		vi.setSystemTime(now);
		const notifications = mockDependencies({
			permissions: {
				granted: false,
				status: "undetermined",
				canAskAgain: true,
			},
			requestedGranted: true,
			todos: [BASE_TODO],
			platformOs: "android",
		});
		const { default: service } =
			await import("@/services/todoReminderService");

		const result = await service.syncTodoReminders(database);
		vi.useRealTimers();

		expect(result.permissionState).toBe("granted");
		expect(result.scheduledCount).toBeGreaterThan(0);
		expect(notifications.requestPermissionsAsync).toHaveBeenCalled();
		expect(notifications.setNotificationChannelAsync).toHaveBeenCalled();
		expect(notifications.scheduleNotificationAsync).toHaveBeenCalled();
	});

	it("skips the android notification channel setup on non-android platforms", async () => {
		const notifications = mockDependencies({
			platformOs: "ios",
			todos: [],
		});
		const { default: service } =
			await import("@/services/todoReminderService");

		await service.syncTodoReminders(database);

		expect(
			notifications.setNotificationChannelAsync,
		).not.toHaveBeenCalled();
	});

	it("only configures the notification handler once across multiple syncs", async () => {
		const notifications = mockDependencies({ todos: [] });
		const { default: service } =
			await import("@/services/todoReminderService");

		await service.syncTodoReminders(database);
		await service.syncTodoReminders(database);

		expect(notifications.setNotificationHandler).toHaveBeenCalledTimes(1);
	});

	it("configures a notification handler that resolves with the expected presentation options", async () => {
		const notifications = mockDependencies({ todos: [] });
		const { default: service } =
			await import("@/services/todoReminderService");

		await service.syncTodoReminders(database);

		const handlerConfig =
			notifications.setNotificationHandler.mock.calls[0]?.[0];
		await expect(handlerConfig.handleNotification()).resolves.toEqual({
			shouldPlaySound: true,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: true,
		});
	});

	it("treats the android channel setup as skipped when the platform cannot be determined", async () => {
		const notifications = mockDependencies({ todos: [] });
		vi.doMock("react-native", () => {
			throw new Error("react-native unavailable");
		});
		const { default: service } =
			await import("@/services/todoReminderService");

		await service.syncTodoReminders(database);

		expect(
			notifications.setNotificationChannelAsync,
		).not.toHaveBeenCalled();
	});
});
