import { afterEach, describe, expect, it, vi } from "vitest";

import type AutoBackupSettings from "@/types/AutoBackupSettings";

import type { SQLiteDatabase } from "expo-sqlite";

const EMPTY_SETTINGS: AutoBackupSettings = {
	enabled: false,
	intervalDays: 1,
	directoryUri: null,
	lastBackupAt: 0,
};

const ACTIVE_SETTINGS: AutoBackupSettings = {
	enabled: true,
	intervalDays: 1,
	directoryUri: "content://com.example.dir",
	lastBackupAt: 0,
};

describe("autoBackupService", () => {
	const database = {} as unknown as SQLiteDatabase;

	afterEach(() => {
		vi.resetModules();
		vi.doUnmock("react-native");
		vi.doUnmock("expo-file-system");
		vi.doUnmock("expo-file-system/legacy");
		vi.doUnmock("expo-notifications");
		vi.doUnmock("@/services/settingsService");
	});

	const mockDependencies = (options: {
		settings?: AutoBackupSettings;
		platformOs?: string;
		serializeAsync?: () => Promise<Uint8Array>;
		fileExists?: boolean;
		readAsStringAsyncResult?: string;
		createFileAsyncResult?: string;
		writeAsStringAsyncError?: Error;
		updateLastBackupAtMock?: ReturnType<typeof vi.fn>;
	}): {
		createFileAsync: ReturnType<typeof vi.fn>;
		writeAsStringAsync: ReturnType<typeof vi.fn>;
		readAsStringAsync: ReturnType<typeof vi.fn>;
		readDirectoryAsync: ReturnType<typeof vi.fn>;
		updateAutoBackupLastBackupAt: ReturnType<typeof vi.fn>;
	} => {
		const {
			settings = ACTIVE_SETTINGS,
			platformOs = "android",
			serializeAsync = () => Promise.resolve(new Uint8Array([1, 2, 3])),
			fileExists = false,
			readAsStringAsyncResult = "base64data",
			createFileAsyncResult = "content://com.example.dir/file.purplecoins",
			writeAsStringAsyncError,
			updateLastBackupAtMock = vi.fn().mockResolvedValue(undefined),
		} = options;

		const createFileAsyncMock = vi
			.fn()
			.mockResolvedValue(createFileAsyncResult);
		const writeAsStringAsyncMock = writeAsStringAsyncError
			? vi.fn().mockRejectedValue(writeAsStringAsyncError)
			: vi.fn().mockResolvedValue(undefined);
		const readAsStringAsyncMock = vi
			.fn()
			.mockResolvedValue(readAsStringAsyncResult);
		const readDirectoryAsyncMock = vi.fn().mockResolvedValue([]);
		const deleteMock = vi.fn();

		vi.doMock("react-native", () => ({
			Platform: { OS: platformOs },
		}));
		vi.doMock("expo-file-system", () => ({
			File: vi.fn().mockImplementation(function FakeFile() {
				return {
					exists: fileExists,
					create: vi.fn(),
					write: vi.fn(),
					delete: deleteMock,
					uri: "file://cache/backup.purplecoins",
				};
			}),
			Paths: { cache: "mock://cache" },
		}));
		vi.doMock("expo-file-system/legacy", () => ({
			StorageAccessFramework: {
				readDirectoryAsync: readDirectoryAsyncMock,
				createFileAsync: createFileAsyncMock,
				writeAsStringAsync: writeAsStringAsyncMock,
				requestDirectoryPermissionsAsync: vi.fn(),
			},
			readAsStringAsync: readAsStringAsyncMock,
			EncodingType: { Base64: "base64" },
		}));
		vi.doMock("@/services/settingsService", () => ({
			default: {
				getAutoBackupSettings: vi.fn().mockResolvedValue(settings),
				updateAutoBackupLastBackupAt: updateLastBackupAtMock,
			},
		}));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(database as any).serializeAsync = serializeAsync;

		return {
			createFileAsync: createFileAsyncMock,
			writeAsStringAsync: writeAsStringAsyncMock,
			readAsStringAsync: readAsStringAsyncMock,
			readDirectoryAsync: readDirectoryAsyncMock,
			updateAutoBackupLastBackupAt: updateLastBackupAtMock,
		};
	};

	const mockNotificationDependencies = (options: {
		settings?: AutoBackupSettings;
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
		reactNativeMock?: () => Record<string, unknown>;
	}): {
		scheduleNotificationAsync: ReturnType<typeof vi.fn>;
		cancelScheduledNotificationAsync: ReturnType<typeof vi.fn>;
		setNotificationHandler: ReturnType<typeof vi.fn>;
		setNotificationChannelAsync: ReturnType<typeof vi.fn>;
		AndroidImportance: { HIGH: number };
	} => {
		const {
			settings = ACTIVE_SETTINGS,
			platformOs = "android",
			permissions = { granted: true },
			requestedGranted = true,
			scheduled = [],
			reactNativeMock,
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
		vi.doMock(
			"react-native",
			reactNativeMock ?? (() => ({ Platform: { OS: platformOs } })),
		);
		vi.doMock("@/services/settingsService", () => ({
			default: {
				getAutoBackupSettings: vi.fn().mockResolvedValue(settings),
				updateAutoBackupLastBackupAt: vi
					.fn()
					.mockResolvedValue(undefined),
			},
		}));
		vi.doMock("expo-file-system", () => ({
			File: vi.fn(),
			Paths: { cache: "mock://cache" },
		}));
		vi.doMock("expo-file-system/legacy", () => ({
			StorageAccessFramework: {
				readDirectoryAsync: vi.fn().mockResolvedValue([]),
				createFileAsync: vi.fn(),
				writeAsStringAsync: vi.fn(),
			},
			readAsStringAsync: vi.fn(),
		}));

		return notificationsMock;
	};

	describe("runAutoBackupIfDue", () => {
		it("returns not-android on non-Android platforms", async () => {
			mockDependencies({ platformOs: "ios" });
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.runAutoBackupIfDue(database);

			expect(result).toEqual({ result: "not-android" });
		});

		it("returns disabled when auto-backup is turned off", async () => {
			mockDependencies({
				settings: { ...ACTIVE_SETTINGS, enabled: false },
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.runAutoBackupIfDue(database);

			expect(result).toEqual({ result: "disabled" });
		});

		it("returns no-directory when no folder has been chosen", async () => {
			mockDependencies({
				settings: { ...ACTIVE_SETTINGS, directoryUri: null },
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.runAutoBackupIfDue(database);

			expect(result).toEqual({ result: "no-directory" });
		});

		it("returns up-to-date when the backup interval has not elapsed yet", async () => {
			const NOW = 1_000_000_000_000; // a realistic timestamp
			vi.useFakeTimers();
			vi.setSystemTime(NOW);
			mockDependencies({
				settings: {
					...ACTIVE_SETTINGS,
					intervalDays: 1,
					lastBackupAt: NOW - 3_600_000, // 1 hour ago, interval is 1 day
				},
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.runAutoBackupIfDue(database);
			vi.useRealTimers();

			expect(result).toEqual({ result: "up-to-date" });
		});

		it("runs the backup and returns success when due (lastBackupAt === 0)", async () => {
			const { updateAutoBackupLastBackupAt } = mockDependencies({});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.runAutoBackupIfDue(database);

			expect(result).toEqual({ result: "success" });
			expect(updateAutoBackupLastBackupAt).toHaveBeenCalledWith(
				database,
				expect.any(Number),
			);
		});

		it("runs the backup when the interval has fully elapsed", async () => {
			const DAY_MS = 86_400_000;
			const NOW = DAY_MS * 100;
			vi.useFakeTimers();
			vi.setSystemTime(NOW);
			mockDependencies({
				settings: {
					...ACTIVE_SETTINGS,
					intervalDays: 1,
					lastBackupAt: NOW - DAY_MS * 2, // 2 days ago
				},
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.runAutoBackupIfDue(database);
			vi.useRealTimers();

			expect(result).toEqual({ result: "success" });
		});

		it("writes the serialized database content to the SAF file", async () => {
			const { createFileAsync, writeAsStringAsync, readAsStringAsync } =
				mockDependencies({
					readAsStringAsyncResult: "DEADBEEF==",
					createFileAsyncResult: "content://dir/newfile",
				});
			const { default: service } =
				await import("@/services/autoBackupService");

			await service.runAutoBackupIfDue(database);

			expect(readAsStringAsync).toHaveBeenCalledWith(
				"file://cache/backup.purplecoins",
				{ encoding: "base64" },
			);
			expect(createFileAsync).toHaveBeenCalledWith(
				"content://com.example.dir",
				expect.stringContaining(".purplecoins"),
				expect.any(String),
			);
			expect(writeAsStringAsync).toHaveBeenCalledWith(
				"content://dir/newfile",
				"DEADBEEF==",
				{ encoding: "base64" },
			);
		});

		it("deletes the temp cache file when it exists after a successful write", async () => {
			const deleteMock = vi.fn();
			vi.doMock("react-native", () => ({ Platform: { OS: "android" } }));
			vi.doMock("expo-file-system", () => ({
				File: vi.fn().mockImplementation(function FakeFile() {
					return {
						exists: true,
						create: vi.fn(),
						write: vi.fn(),
						delete: deleteMock,
						uri: "file://cache/backup.purplecoins",
					};
				}),
				Paths: { cache: "mock://cache" },
			}));
			vi.doMock("expo-file-system/legacy", () => ({
				StorageAccessFramework: {
					readDirectoryAsync: vi.fn().mockResolvedValue([]),
					createFileAsync: vi
						.fn()
						.mockResolvedValue("content://dir/file"),
					writeAsStringAsync: vi.fn().mockResolvedValue(undefined),
				},
				readAsStringAsync: vi.fn().mockResolvedValue("base64"),
				EncodingType: { Base64: "base64" },
			}));
			vi.doMock("@/services/settingsService", () => ({
				default: {
					getAutoBackupSettings: vi
						.fn()
						.mockResolvedValue(ACTIVE_SETTINGS),
					updateAutoBackupLastBackupAt: vi
						.fn()
						.mockResolvedValue(undefined),
				},
			}));
			const fakeDatabaseWithSerialize = {
				serializeAsync: vi
					.fn()
					.mockResolvedValue(new Uint8Array([1, 2, 3])),
			} as unknown as SQLiteDatabase;
			const { default: service } =
				await import("@/services/autoBackupService");

			await service.runAutoBackupIfDue(fakeDatabaseWithSerialize);

			expect(deleteMock).toHaveBeenCalled();
		});

		it("returns error when the SAF write throws", async () => {
			mockDependencies({
				writeAsStringAsyncError: new Error("SAF permission revoked"),
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.runAutoBackupIfDue(database);

			expect(result).toEqual({ result: "error" });
		});
	});

	describe("syncAutoBackupReminder", () => {
		it("reports unavailable when expo-notifications cannot be loaded", async () => {
			vi.doMock("expo-notifications", () => {
				throw new Error("module unavailable");
			});
			vi.doMock("react-native", () => ({ Platform: { OS: "android" } }));
			vi.doMock("@/services/settingsService", () => ({
				default: {
					getAutoBackupSettings: vi
						.fn()
						.mockResolvedValue(ACTIVE_SETTINGS),
					updateAutoBackupLastBackupAt: vi
						.fn()
						.mockResolvedValue(undefined),
				},
			}));
			vi.doMock("expo-file-system", () => ({
				File: vi.fn(),
				Paths: { cache: "mock://cache" },
			}));
			vi.doMock("expo-file-system/legacy", () => ({
				StorageAccessFramework: { createFileAsync: vi.fn() },
				readAsStringAsync: vi.fn(),
			}));
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.syncAutoBackupReminder(database);

			expect(result).toEqual({
				permissionState: "unavailable",
				scheduled: false,
			});
		});

		it("reports disabled when auto-backup is off or directory is not set", async () => {
			mockNotificationDependencies({
				settings: EMPTY_SETTINGS,
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.syncAutoBackupReminder(database);

			expect(result).toEqual({
				permissionState: "disabled",
				scheduled: false,
			});
		});

		it("reports disabled when lastBackupAt is 0 (never backed up)", async () => {
			mockNotificationDependencies({
				settings: { ...ACTIVE_SETTINGS, lastBackupAt: 0 },
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.syncAutoBackupReminder(database);

			expect(result).toEqual({
				permissionState: "disabled",
				scheduled: false,
			});
		});

		it("reports denied when notification permission is refused and cannot be re-requested", async () => {
			mockNotificationDependencies({
				settings: { ...ACTIVE_SETTINGS, lastBackupAt: 1000 },
				permissions: {
					granted: false,
					status: "denied",
					canAskAgain: false,
				},
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.syncAutoBackupReminder(database);

			expect(result).toEqual({
				permissionState: "denied",
				scheduled: false,
			});
		});

		it("schedules a future reminder when all conditions are met", async () => {
			const notifications = mockNotificationDependencies({
				settings: { ...ACTIVE_SETTINGS, lastBackupAt: 1_000_000 },
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.syncAutoBackupReminder(database);

			expect(result).toEqual({
				permissionState: "granted",
				scheduled: true,
			});
			expect(
				notifications.scheduleNotificationAsync,
			).toHaveBeenCalledWith(
				expect.objectContaining({
					trigger: new Date(1_000_000 + 86_400_000),
				}),
			);
		});

		it("cancels existing backup reminder notifications before scheduling a new one", async () => {
			const notifications = mockNotificationDependencies({
				settings: { ...ACTIVE_SETTINGS, lastBackupAt: 1_000_000 },
				scheduled: [
					{
						identifier: "old-backup-reminder",
						content: {
							data: { ownerType: "AUTO_BACKUP_REMINDER" },
						},
					},
					{
						identifier: "other-notification",
						content: { data: { ownerType: "OTHER" } },
					},
				],
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			await service.syncAutoBackupReminder(database);

			expect(
				notifications.cancelScheduledNotificationAsync,
			).toHaveBeenCalledWith("old-backup-reminder");
			expect(
				notifications.cancelScheduledNotificationAsync,
			).not.toHaveBeenCalledWith("other-notification");
		});

		it("uses plural 'days' when intervalDays is greater than one", async () => {
			const notifications = mockNotificationDependencies({
				settings: {
					...ACTIVE_SETTINGS,
					intervalDays: 3,
					lastBackupAt: 1_000_000,
				},
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			await service.syncAutoBackupReminder(database);

			expect(
				notifications.scheduleNotificationAsync,
			).toHaveBeenCalledWith(
				expect.objectContaining({
					content: expect.objectContaining({
						body: expect.stringContaining("3 days"),
					}),
				}),
			);
		});

		it("skips the Android channel setup on non-Android platforms", async () => {
			const notifications = mockNotificationDependencies({
				settings: { ...ACTIVE_SETTINGS, lastBackupAt: 1_000_000 },
				platformOs: "ios",
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			await service.syncAutoBackupReminder(database);

			expect(
				notifications.setNotificationChannelAsync,
			).not.toHaveBeenCalled();
		});

		it("only configures the notification handler once across multiple syncs", async () => {
			const notifications = mockNotificationDependencies({
				settings: { ...ACTIVE_SETTINGS, lastBackupAt: 1_000_000 },
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			await service.syncAutoBackupReminder(database);
			await service.syncAutoBackupReminder(database);

			expect(notifications.setNotificationHandler).toHaveBeenCalledTimes(
				1,
			);
		});

		it("reports denied when permission request is refused at runtime", async () => {
			mockNotificationDependencies({
				settings: { ...ACTIVE_SETTINGS, lastBackupAt: 1_000_000 },
				permissions: {
					granted: false,
					status: "undetermined",
					canAskAgain: true,
				},
				requestedGranted: false,
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			const result = await service.syncAutoBackupReminder(database);

			expect(result).toEqual({
				permissionState: "denied",
				scheduled: false,
			});
		});

		it("configures a notification handler that resolves with the expected presentation options", async () => {
			const notifications = mockNotificationDependencies({
				settings: { ...ACTIVE_SETTINGS, lastBackupAt: 1_000_000 },
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			await service.syncAutoBackupReminder(database);

			const handlerConfig =
				notifications.setNotificationHandler.mock.calls[0]?.[0];
			await expect(handlerConfig.handleNotification()).resolves.toEqual({
				shouldPlaySound: false,
				shouldSetBadge: false,
				shouldShowBanner: true,
				shouldShowList: true,
			});
		});

		it("treats Android channel setup as skipped when platform cannot be determined", async () => {
			const notifications = mockNotificationDependencies({
				settings: { ...ACTIVE_SETTINGS, lastBackupAt: 1_000_000 },
				platformOs: "ios",
			});
			const { default: service } =
				await import("@/services/autoBackupService");

			await service.syncAutoBackupReminder(database);

			expect(
				notifications.setNotificationChannelAsync,
			).not.toHaveBeenCalled();
		});
	});
});
