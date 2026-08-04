import settingsService from "@/services/settingsService";

import { File, Paths } from "expo-file-system";
import {
	StorageAccessFramework,
	readAsStringAsync,
} from "expo-file-system/legacy";

import appConstants from "@/constants/appConstants";
import type * as ExpoNotifications from "expo-notifications";
import type { SQLiteDatabase } from "expo-sqlite";

const { APP_NAME, BACKUP_EXTENSION, BACKUP_MIME_TYPE, MILLISECONDS_PER_DAY } =
	appConstants;
const { getAutoBackupSettings, updateAutoBackupLastBackupAt } = settingsService;

const AUTO_BACKUP_REMINDER_OWNER_TYPE = "AUTO_BACKUP_REMINDER";
const AUTO_BACKUP_REMINDER_CHANNEL_ID = "auto-backup-reminders";

// EncodingType.Base64 value from expo-file-system/legacy.
const BASE64_ENCODING = "base64" as const;

let notificationHandlerConfigured = false;

type NotificationsModule = typeof ExpoNotifications;

type AutoBackupResult =
	| "success"
	| "up-to-date"
	| "disabled"
	| "no-directory"
	| "not-android"
	| "error";

type AutoBackupSyncResult = Readonly<{
	result: AutoBackupResult;
}>;

type AutoBackupReminderPermissionState =
	"granted" | "denied" | "disabled" | "unavailable";

type AutoBackupReminderSyncResult = Readonly<{
	permissionState: AutoBackupReminderPermissionState;
	scheduled: boolean;
}>;

const createAutoBackupFileName = (): string => {
	const date = new Date().toISOString().slice(0, 10);
	return `${APP_NAME.toLowerCase()}-${date}${BACKUP_EXTENSION}`;
};

const createAutoBackupUniqueFileName = (): string => {
	const isoTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
	return `${APP_NAME.toLowerCase()}-${isoTimestamp}${BACKUP_EXTENSION}`;
};

const writeBackupToSafDirectory = async (
	database: SQLiteDatabase,
	directoryUri: string,
): Promise<void> => {
	await StorageAccessFramework.readDirectoryAsync(directoryUri);

	const tempFile = new File(Paths.cache, createAutoBackupUniqueFileName());
	tempFile.create({ overwrite: true, intermediates: true });
	tempFile.write(await database.serializeAsync());

	const base64Content = await readAsStringAsync(tempFile.uri, {
		encoding: BASE64_ENCODING,
	});

	let safFileUri: string;
	try {
		safFileUri = await StorageAccessFramework.createFileAsync(
			directoryUri,
			createAutoBackupFileName(),
			BACKUP_MIME_TYPE,
		);
	} catch {
		safFileUri = await StorageAccessFramework.createFileAsync(
			directoryUri,
			createAutoBackupUniqueFileName(),
			BACKUP_MIME_TYPE,
		);
	}

	await StorageAccessFramework.writeAsStringAsync(safFileUri, base64Content, {
		encoding: BASE64_ENCODING,
	});

	if (tempFile.exists) {
		tempFile.delete();
	}
};

const loadNotificationsModule =
	async (): Promise<NotificationsModule | null> => {
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
		/* v8 ignore start */
	} catch {
		return null;
	}
	/* v8 ignore stop */
};

const runAutoBackupIfDue = async (
	database: SQLiteDatabase,
): Promise<AutoBackupSyncResult> => {
	if ((await getPlatformOs()) !== "android") {
		return { result: "not-android" };
	}

	const settings = await getAutoBackupSettings(database);

	if (!settings.enabled) {
		return { result: "disabled" };
	}
	if (!settings.directoryUri) {
		return { result: "no-directory" };
	}

	const now = Date.now();
	if (
		settings.lastBackupAt > 0 &&
		now - settings.lastBackupAt <
			settings.intervalDays * MILLISECONDS_PER_DAY
	) {
		return { result: "up-to-date" };
	}

	try {
		await writeBackupToSafDirectory(database, settings.directoryUri);
		await updateAutoBackupLastBackupAt(database, now);
		return { result: "success" };
	} catch (caughtError: unknown) {
		console.error("Auto-backup failed", caughtError);
		return { result: "error" };
	}
};

const runAutoBackupNow = async (
	database: SQLiteDatabase,
): Promise<AutoBackupSyncResult> => {
	if ((await getPlatformOs()) !== "android") {
		return { result: "not-android" };
	}

	const settings = await getAutoBackupSettings(database);
	if (!settings.directoryUri) {
		return { result: "no-directory" };
	}

	try {
		await writeBackupToSafDirectory(database, settings.directoryUri);
		await updateAutoBackupLastBackupAt(database, Date.now());
		return { result: "success" };
	} catch (caughtError: unknown) {
		console.error("Manual auto-backup failed", caughtError);
		return { result: "error" };
	}
};

const ensureNotificationHandlerConfigured = (
	notifications: NotificationsModule,
): void => {
	/* v8 ignore start */
	if (notificationHandlerConfigured) {
		return;
	}
	/* v8 ignore stop */
	notifications.setNotificationHandler({
		handleNotification: () =>
			Promise.resolve({
				shouldPlaySound: false,
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
	await notifications.setNotificationChannelAsync(
		AUTO_BACKUP_REMINDER_CHANNEL_ID,
		{
			name: "Auto-backup reminders",
			importance: notifications.AndroidImportance.HIGH,
			lightColor: "#A87CFF",
			vibrationPattern: [0, 250, 250, 250],
		},
	);
};

const hasBackupReminderMarker = (
	data: Record<string, unknown> | null | undefined,
): boolean => data?.ownerType === AUTO_BACKUP_REMINDER_OWNER_TYPE;

const clearBackupReminderNotifications = async (
	notifications: NotificationsModule,
): Promise<void> => {
	const scheduledNotifications =
		await notifications.getAllScheduledNotificationsAsync();
	await Promise.all(
		scheduledNotifications
			.filter((notification) =>
				hasBackupReminderMarker(notification.content.data),
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

// Schedules a single "Back up your data" reminder for `lastBackupAt + intervalDays`.
// Clears any previous reminder first so only one is ever pending at a time.
const syncAutoBackupReminder = async (
	database: SQLiteDatabase,
): Promise<AutoBackupReminderSyncResult> => {
	const notifications = await loadNotificationsModule();
	if (!notifications) {
		return { permissionState: "unavailable", scheduled: false };
	}

	ensureNotificationHandlerConfigured(notifications);
	await ensureAndroidChannel(notifications);
	await clearBackupReminderNotifications(notifications);

	const settings = await getAutoBackupSettings(database);
	if (
		!settings.enabled ||
		!settings.directoryUri ||
		settings.lastBackupAt === 0
	) {
		return { permissionState: "disabled", scheduled: false };
	}

	const hasPermission = await ensureNotificationPermissions(notifications);
	if (!hasPermission) {
		return { permissionState: "denied", scheduled: false };
	}

	const triggerAt =
		settings.lastBackupAt + settings.intervalDays * MILLISECONDS_PER_DAY;

	await notifications.scheduleNotificationAsync({
		content: {
			title: "Back up your data",
			body: `It\u2019s been ${settings.intervalDays} day${settings.intervalDays === 1 ? "" : "s"} since your last auto-backup.`,
			data: {
				ownerType: AUTO_BACKUP_REMINDER_OWNER_TYPE,
			},
			sound: false,
		},
		trigger: new Date(triggerAt),
	});
	return { permissionState: "granted", scheduled: true };
};

const autoBackupService = {
	runAutoBackupNow,
	runAutoBackupIfDue,
	syncAutoBackupReminder,
};

export type { AutoBackupReminderSyncResult, AutoBackupSyncResult };
export default autoBackupService;
