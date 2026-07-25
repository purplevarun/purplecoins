import type * as ExpoNotifications from "expo-notifications";
import settingsService from "@/services/settingsService";
import todoService from "@/services/todoService";
import type Todo from "@/types/Todo";
import type TodoReminderSettings from "@/types/TodoReminderSettings";
import dateUtils from "@/utils/date";
import type { SQLiteDatabase } from "expo-sqlite";

const { formatDate } = dateUtils;
const { getTodoReminderSettings } = settingsService;
const { getTodos } = todoService;

const TODO_REMINDER_OWNER_TYPE = "TODO_REMINDER";
const TODO_REMINDER_CHANNEL_ID = "todo-reminders";
const TODO_REMINDER_START_HOUR = 9;
const TODO_REMINDER_START_MINUTE = 0;
const TODO_REMINDER_MIN_LEAD_TIME_MS = 60_000;
const MAX_PENDING_TODO_REMINDERS = 60;

let notificationHandlerConfigured = false;

type NotificationsModule = typeof ExpoNotifications;

type TodoReminderPermissionState =
	| "granted"
	| "denied"
	| "disabled"
	| "unavailable";

type TodoReminderRequest = Readonly<{
	todoId: string;
	title: string;
	body: string;
	triggerAt: number;
}>;

type TodoReminderSyncResult = Readonly<{
	permissionState: TodoReminderPermissionState;
	scheduledCount: number;
}>;

const getDueDayEndAt = (dueAt: number): number => {
	const dueDate = new Date(dueAt);
	dueDate.setHours(23, 59, 59, 999);
	return dueDate.getTime();
};

const getReminderWindowStartAt = (
	dueAt: number,
	daysBeforeDue: number,
): number => {
	const startDate = new Date(dueAt);
	startDate.setDate(startDate.getDate() - daysBeforeDue);
	startDate.setHours(
		TODO_REMINDER_START_HOUR,
		TODO_REMINDER_START_MINUTE,
		0,
		0,
	);
	return startDate.getTime();
};

const getRepeatIntervalMs = (repeatHours: number): number =>
	repeatHours * 60 * 60 * 1000;

const getFirstReminderAt = (
	startAt: number,
	dueEndAt: number,
	repeatIntervalMs: number,
	now: number,
): number | null => {
	const earliestAllowedAt = Math.max(
		startAt,
		now + TODO_REMINDER_MIN_LEAD_TIME_MS,
	);
	if (earliestAllowedAt > dueEndAt) {
		return null;
	}
	const elapsedMs = Math.max(0, earliestAllowedAt - startAt);
	const steps = Math.ceil(elapsedMs / repeatIntervalMs);
	const firstReminderAt = startAt + steps * repeatIntervalMs;
	return firstReminderAt <= dueEndAt ? firstReminderAt : null;
};

const buildTodoReminderRequestsForTodo = (
	todo: Todo,
	settings: TodoReminderSettings,
	now: number,
): readonly TodoReminderRequest[] => {
	if (todo.isDone || todo.dueAt === null) {
		return [];
	}

	const dueEndAt = getDueDayEndAt(todo.dueAt);
	if (dueEndAt <= now) {
		return [];
	}

	const repeatIntervalMs = getRepeatIntervalMs(settings.repeatHours);
	const startAt = getReminderWindowStartAt(todo.dueAt, settings.daysBeforeDue);
	const firstReminderAt = getFirstReminderAt(
		startAt,
		dueEndAt,
		repeatIntervalMs,
		now,
	);
	if (firstReminderAt === null) {
		return [];
	}

	const requests: TodoReminderRequest[] = [];
	for (
		let triggerAt = firstReminderAt;
		triggerAt <= dueEndAt;
		triggerAt += repeatIntervalMs
	) {
		requests.push({
			todoId: todo.id,
			title: "Todo reminder",
			body: `${todo.title} is due on ${formatDate(todo.dueAt)}.`,
			triggerAt,
		});
	}
	return requests;
};

const buildTodoReminderSchedule = (
	todos: readonly Todo[],
	settings: TodoReminderSettings,
	now: number,
): readonly TodoReminderRequest[] =>
	[...todos]
		.flatMap((todo) => buildTodoReminderRequestsForTodo(todo, settings, now))
		.sort(
			(left, right) =>
				left.triggerAt - right.triggerAt ||
				left.todoId.localeCompare(right.todoId),
		)
		.slice(0, MAX_PENDING_TODO_REMINDERS);

const loadNotificationsModule = async (): Promise<NotificationsModule | null> => {
	try {
		return await import("expo-notifications");
	} catch {
		return null;
	}
};

const getPlatformOs = async (): Promise<string | null> => {
	try {
		const reactNative = await import("react-native");
		return reactNative.Platform.OS;
	} catch {
		return null;
	}
};

const ensureNotificationHandlerConfigured = (
	notifications: NotificationsModule,
): void => {
	if (notificationHandlerConfigured) {
		return;
	}
	notifications.setNotificationHandler({
		handleNotification: () =>
			Promise.resolve({
			shouldPlaySound: true,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: true,
			}),
	});
	notificationHandlerConfigured = true;
};

const ensureAndroidChannel = async (
	notifications: NotificationsModule,
): Promise<void> => {
	if ((await getPlatformOs()) !== "android") {
		return;
	}
	await notifications.setNotificationChannelAsync(TODO_REMINDER_CHANNEL_ID, {
		name: "Todo reminders",
		importance: notifications.AndroidImportance.HIGH,
		lightColor: "#A87CFF",
		sound: "default",
		vibrationPattern: [0, 250, 250, 250],
	});
};

const hasTodoReminderMarker = (
	data: Record<string, unknown> | null | undefined,
): boolean => data?.ownerType === TODO_REMINDER_OWNER_TYPE;

const clearTodoReminderNotifications = async (
	notifications: NotificationsModule,
): Promise<void> => {
	const scheduledNotifications =
		await notifications.getAllScheduledNotificationsAsync();
	await Promise.all(
		scheduledNotifications
			.filter((notification) =>
				hasTodoReminderMarker(notification.content.data),
			)
			.map((notification) =>
				notifications.cancelScheduledNotificationAsync(
					notification.identifier,
				),
			),
	);
};

const ensureNotificationPermissions = async (
	notifications: NotificationsModule,
): Promise<boolean> => {
	const existingPermissions = await notifications.getPermissionsAsync();
	if (existingPermissions.granted) {
		return true;
	}
	if (
		existingPermissions.status === "denied" &&
		!existingPermissions.canAskAgain
	) {
		return false;
	}
	const requestedPermissions = await notifications.requestPermissionsAsync();
	return requestedPermissions.granted;
};

const syncTodoReminders = async (
	database: SQLiteDatabase,
): Promise<TodoReminderSyncResult> => {
	const notifications = await loadNotificationsModule();
	if (!notifications) {
		return { permissionState: "unavailable", scheduledCount: 0 };
	}

	ensureNotificationHandlerConfigured(notifications);
	await ensureAndroidChannel(notifications);

	const settings = await getTodoReminderSettings(database);
	await clearTodoReminderNotifications(notifications);
	if (!settings.enabled) {
		return { permissionState: "disabled", scheduledCount: 0 };
	}

	const hasPermission = await ensureNotificationPermissions(notifications);
	if (!hasPermission) {
		return { permissionState: "denied", scheduledCount: 0 };
	}

	const todos = await getTodos(database);
	const requests = buildTodoReminderSchedule(todos, settings, Date.now());
	await Promise.all(
		requests.map((request) =>
			notifications.scheduleNotificationAsync({
				content: {
					title: request.title,
					body: request.body,
					data: {
						ownerType: TODO_REMINDER_OWNER_TYPE,
						todoId: request.todoId,
						triggerAt: request.triggerAt,
					},
					sound: "default",
				},
				trigger: new Date(request.triggerAt),
			}),
		),
	);
	return { permissionState: "granted", scheduledCount: requests.length };
};

const todoReminderService = {
	buildTodoReminderSchedule,
	syncTodoReminders,
};

export type { TodoReminderSyncResult };
export default todoReminderService;



