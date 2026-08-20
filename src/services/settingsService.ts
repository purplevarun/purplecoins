import settingsRepository from "@/repositories/settingsRepository";
import type { SQLiteDatabase } from "expo-sqlite";

import HOME_MODES from "@/constants/homeModes";
import type AutoBackupSettings from "@/types/AutoBackupSettings";
import type HomeMode from "@/types/HomeMode";
import type TodoReminderSettings from "@/types/TodoReminderSettings";

const { getSettingRow, upsertSettingRow } = settingsRepository;

const NATIVE_CURRENCY_KEY = "native_currency_display";
const FY_START_MONTH_KEY = "fy_start_month";
const DEFAULT_TRIP_ID_KEY = "default_trip_id";
const DEFAULT_HOME_MODE_KEY = "default_home_mode";
const AUTO_BACKUP_ENABLED_KEY = "auto_backup_enabled";
const AUTO_BACKUP_INTERVAL_DAYS_KEY = "auto_backup_interval_days";
const AUTO_BACKUP_DIRECTORY_URI_KEY = "auto_backup_directory_uri";
const AUTO_BACKUP_LAST_BACKUP_AT_KEY = "auto_backup_last_backup_at";
const TODO_REMINDERS_ENABLED_KEY = "todo_reminders_enabled";
const TODO_REMINDER_DAYS_BEFORE_DUE_KEY = "todo_reminder_days_before_due";
const TODO_REMINDER_REPEAT_HOURS_KEY = "todo_reminder_repeat_hours";

const AUTO_BACKUP_INTERVAL_DAYS_MIN = 1;
const AUTO_BACKUP_INTERVAL_DAYS_MAX = 30;
const DEFAULT_AUTO_BACKUP_SETTINGS: AutoBackupSettings = {
	enabled: false,
	intervalDays: 1,
	directoryUri: null,
	lastBackupAt: 0,
};

const DEFAULT_TODO_REMINDER_SETTINGS: TodoReminderSettings = {
	enabled: true,
	daysBeforeDue: 2,
	repeatHours: 12,
};
const TODO_REMINDER_DAYS_MIN = 0;
const TODO_REMINDER_DAYS_MAX = 30;
const TODO_REMINDER_REPEAT_HOURS_MIN = 1;
const TODO_REMINDER_REPEAT_HOURS_MAX = 24;

const isHomeMode = (value: string | null): value is HomeMode =>
	value !== null && (HOME_MODES as readonly string[]).includes(value);

const clampInteger = (
	value: number,
	minimum: number,
	maximum: number,
): number => Math.min(maximum, Math.max(minimum, Math.round(value)));

const parseIntegerSetting = (
	value: string | null,
	fallback: number,
	minimum: number,
	maximum: number,
): number => {
	if (!value) {
		return fallback;
	}
	const parsed = Number.parseInt(value, 10);
	return Number.isNaN(parsed)
		? fallback
		: clampInteger(parsed, minimum, maximum);
};

const getNativeCurrencyDisplay = async (
	database: SQLiteDatabase,
): Promise<boolean> => {
	const value = await getSettingRow(database, NATIVE_CURRENCY_KEY);
	return value === null ? true : value === "true";
};

const updateNativeCurrencyDisplay = async (
	database: SQLiteDatabase,
	isNativeCurrency: boolean,
): Promise<void> =>
	upsertSettingRow(
		database,
		NATIVE_CURRENCY_KEY,
		String(isNativeCurrency),
		Date.now(),
	);

// FY start month: 1=Jan … 12=Dec, default 4 (April)
const getFyStartMonth = async (database: SQLiteDatabase): Promise<number> => {
	const value = await getSettingRow(database, FY_START_MONTH_KEY);
	if (!value) return 4;
	const parsed = Number.parseInt(value, 10);
	return Number.isNaN(parsed) ? 4 : parsed;
};

const updateFyStartMonth = async (
	database: SQLiteDatabase,
	month: number,
): Promise<void> =>
	upsertSettingRow(database, FY_START_MONTH_KEY, String(month), Date.now());

// Default trip
const getDefaultTripId = async (
	database: SQLiteDatabase,
): Promise<string | null> => {
	const value = await getSettingRow(database, DEFAULT_TRIP_ID_KEY);
	return value ?? null;
};

const updateDefaultTripId = async (
	database: SQLiteDatabase,
	tripId: string | null,
): Promise<void> =>
	upsertSettingRow(database, DEFAULT_TRIP_ID_KEY, tripId ?? "", Date.now());

// Default homepage mode shown when the app launches
const getDefaultHomeMode = async (
	database: SQLiteDatabase,
): Promise<HomeMode> => {
	const value = await getSettingRow(database, DEFAULT_HOME_MODE_KEY);
	return isHomeMode(value) ? value : "TOOLS";
};

const updateDefaultHomeMode = async (
	database: SQLiteDatabase,
	mode: HomeMode,
): Promise<void> =>
	upsertSettingRow(database, DEFAULT_HOME_MODE_KEY, mode, Date.now());

// Automatic local backups (Android only — uses SAF for persisted directory access).
const getAutoBackupSettings = async (
	database: SQLiteDatabase,
): Promise<AutoBackupSettings> => {
	const [enabledValue, intervalValue, directoryValue, lastAtValue] =
		await Promise.all([
			getSettingRow(database, AUTO_BACKUP_ENABLED_KEY),
			getSettingRow(database, AUTO_BACKUP_INTERVAL_DAYS_KEY),
			getSettingRow(database, AUTO_BACKUP_DIRECTORY_URI_KEY),
			getSettingRow(database, AUTO_BACKUP_LAST_BACKUP_AT_KEY),
		]);
	return {
		enabled:
			enabledValue === null
				? DEFAULT_AUTO_BACKUP_SETTINGS.enabled
				: enabledValue === "true",
		intervalDays: parseIntegerSetting(
			intervalValue,
			DEFAULT_AUTO_BACKUP_SETTINGS.intervalDays,
			AUTO_BACKUP_INTERVAL_DAYS_MIN,
			AUTO_BACKUP_INTERVAL_DAYS_MAX,
		),
		// An empty string means "cleared" — same pattern as updateDefaultTripId.
		directoryUri:
			directoryValue !== null && directoryValue !== ""
				? directoryValue
				: null,
		lastBackupAt: lastAtValue !== null ? Number(lastAtValue) || 0 : 0,
	};
};

const updateAutoBackupEnabled = async (
	database: SQLiteDatabase,
	enabled: boolean,
): Promise<void> =>
	upsertSettingRow(
		database,
		AUTO_BACKUP_ENABLED_KEY,
		String(enabled),
		Date.now(),
	);

const updateAutoBackupIntervalDays = async (
	database: SQLiteDatabase,
	intervalDays: number,
): Promise<void> =>
	upsertSettingRow(
		database,
		AUTO_BACKUP_INTERVAL_DAYS_KEY,
		String(
			clampInteger(
				intervalDays,
				AUTO_BACKUP_INTERVAL_DAYS_MIN,
				AUTO_BACKUP_INTERVAL_DAYS_MAX,
			),
		),
		Date.now(),
	);

const updateAutoBackupDirectoryUri = async (
	database: SQLiteDatabase,
	uri: string | null,
): Promise<void> =>
	upsertSettingRow(
		database,
		AUTO_BACKUP_DIRECTORY_URI_KEY,
		uri ?? "",
		Date.now(),
	);

const updateAutoBackupLastBackupAt = async (
	database: SQLiteDatabase,
	timestamp: number,
): Promise<void> =>
	upsertSettingRow(
		database,
		AUTO_BACKUP_LAST_BACKUP_AT_KEY,
		String(timestamp),
		Date.now(),
	);

const getTodoReminderSettings = async (
	database: SQLiteDatabase,
): Promise<TodoReminderSettings> => {
	const [enabledValue, daysValue, repeatValue] = await Promise.all([
		getSettingRow(database, TODO_REMINDERS_ENABLED_KEY),
		getSettingRow(database, TODO_REMINDER_DAYS_BEFORE_DUE_KEY),
		getSettingRow(database, TODO_REMINDER_REPEAT_HOURS_KEY),
	]);

	return {
		enabled:
			enabledValue === null
				? DEFAULT_TODO_REMINDER_SETTINGS.enabled
				: enabledValue === "true",
		daysBeforeDue: parseIntegerSetting(
			daysValue,
			DEFAULT_TODO_REMINDER_SETTINGS.daysBeforeDue,
			TODO_REMINDER_DAYS_MIN,
			TODO_REMINDER_DAYS_MAX,
		),
		repeatHours: parseIntegerSetting(
			repeatValue,
			DEFAULT_TODO_REMINDER_SETTINGS.repeatHours,
			TODO_REMINDER_REPEAT_HOURS_MIN,
			TODO_REMINDER_REPEAT_HOURS_MAX,
		),
	};
};

const updateTodoRemindersEnabled = async (
	database: SQLiteDatabase,
	enabled: boolean,
): Promise<void> =>
	upsertSettingRow(
		database,
		TODO_REMINDERS_ENABLED_KEY,
		String(enabled),
		Date.now(),
	);

const updateTodoReminderDaysBeforeDue = async (
	database: SQLiteDatabase,
	daysBeforeDue: number,
): Promise<void> =>
	upsertSettingRow(
		database,
		TODO_REMINDER_DAYS_BEFORE_DUE_KEY,
		String(
			clampInteger(
				daysBeforeDue,
				TODO_REMINDER_DAYS_MIN,
				TODO_REMINDER_DAYS_MAX,
			),
		),
		Date.now(),
	);

const updateTodoReminderRepeatHours = async (
	database: SQLiteDatabase,
	repeatHours: number,
): Promise<void> =>
	upsertSettingRow(
		database,
		TODO_REMINDER_REPEAT_HOURS_KEY,
		String(
			clampInteger(
				repeatHours,
				TODO_REMINDER_REPEAT_HOURS_MIN,
				TODO_REMINDER_REPEAT_HOURS_MAX,
			),
		),
		Date.now(),
	);

const settingsService = {
	getAutoBackupSettings,
	getDefaultHomeMode,
	getDefaultTripId,
	getFyStartMonth,
	getNativeCurrencyDisplay,
	getTodoReminderSettings,
	updateAutoBackupDirectoryUri,
	updateAutoBackupEnabled,
	updateAutoBackupIntervalDays,
	updateAutoBackupLastBackupAt,
	updateDefaultHomeMode,
	updateDefaultTripId,
	updateFyStartMonth,
	updateNativeCurrencyDisplay,
	updateTodoReminderDaysBeforeDue,
	updateTodoReminderRepeatHours,
	updateTodoRemindersEnabled,
};

export default settingsService;
