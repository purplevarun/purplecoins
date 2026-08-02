declare module "expo-notifications" {
	export type PermissionStatus = "undetermined" | "denied" | "granted";

	export type NotificationBehavior = Readonly<{
		shouldPlaySound?: boolean;
		shouldSetBadge?: boolean;
		shouldShowBanner?: boolean;
		shouldShowList?: boolean;
	}>;

	export type NotificationHandler = Readonly<{
		handleNotification: () => Promise<NotificationBehavior>;
	}>;

	export type NotificationPermissionsStatus = Readonly<{
		granted: boolean;
		canAskAgain: boolean;
		status: PermissionStatus;
	}>;

	export type NotificationContentInput = Readonly<{
		title?: string;
		body?: string;
		data?: Record<string, unknown>;
		sound?: boolean | "default";
	}>;

	export type NotificationRequestInput = Readonly<{
		content: NotificationContentInput;
		trigger: Date | null;
	}>;

	export type ScheduledNotificationRequest = Readonly<{
		identifier: string;
		content: Readonly<{
			data?: Record<string, unknown> | null;
		}>;
	}>;

	export const AndroidImportance: Readonly<{
		DEFAULT: number;
		HIGH: number;
	}>;

	export const setNotificationHandler: (handler: NotificationHandler) => void;
	export const getPermissionsAsync: () => Promise<NotificationPermissionsStatus>;
	export const requestPermissionsAsync: () => Promise<NotificationPermissionsStatus>;
	export const getAllScheduledNotificationsAsync: () => Promise<
		readonly ScheduledNotificationRequest[]
	>;
	export const cancelScheduledNotificationAsync: (
		identifier: string,
	) => Promise<void>;
	export const scheduleNotificationAsync: (
		request: NotificationRequestInput,
	) => Promise<string>;
	export const setNotificationChannelAsync: (
		channelId: string,
		channel: Readonly<{
			name: string;
			importance: number;
			vibrationPattern?: readonly number[];
			lightColor?: string;
			sound?: string | null;
		}>,
	) => Promise<void>;
}
