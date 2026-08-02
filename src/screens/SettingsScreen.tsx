import appConstants from "@/constants/appConstants";

import packageJson from "@/../package.json";
import CustomText from "@/components/CustomText";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
	PermissionsAndroid,
	Platform,
	StyleSheet,
	Switch,
	View,
} from "react-native";

import AppButton from "@/components/AppButton";
import GlassCard from "@/components/GlassCard";
import Notice from "@/components/Notice";
import ScreenContainer from "@/components/ScreenContainer";
import SegmentedControl from "@/components/SegmentedControl";
import SelectField from "@/components/SelectField";
import COLORS from "@/constants/colors";
import useAppDialog from "@/hooks/useAppDialog";
import useDatabaseContext from "@/hooks/useDatabaseContext";
import backupService from "@/services/backupService";
import budgetAlertService from "@/services/budgetAlertService";
import settingsService from "@/services/settingsService";
import todoReminderService from "@/services/todoReminderService";
import tripService from "@/services/tripService";
import upiDetectionService from "@/services/upiDetectionService";
import type HomeMode from "@/types/HomeMode";
import type RootStackParamList from "@/types/RootStackParamList";
import type SelectOption from "@/types/SelectOption";
import type Trip from "@/types/Trip";
import getErrorMessage from "@/utils/error";
const { APP_NAME } = appConstants;
const { version } = packageJson;
const { exportBackup, restoreBackup } = backupService;
const { syncBudgetAlerts } = budgetAlertService;
const {
	getBudgetAlertsEnabled,
	getDefaultHomeMode,
	getDefaultTripId,
	getFyStartMonth,
	getNativeCurrencyDisplay,
	getTodoReminderSettings,
	updateBudgetAlertsEnabled,
	updateDefaultHomeMode,
	updateDefaultTripId,
	updateFyStartMonth,
	updateNativeCurrencyDisplay,
	updateTodoReminderDaysBeforeDue,
	updateTodoReminderRepeatHours,
	updateTodoRemindersEnabled,
} = settingsService;
const { syncTodoReminders } = todoReminderService;
const {
	getDetectionEnabled,
	isNotificationAccessEnabled,
	openNotificationAccessSettings,
	setDetectionEnabled,
} = upiDetectionService;
const { getTrips } = tripService;

type SettingsScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Settings"
>;

const HOME_MODE_OPTIONS: readonly SelectOption[] = [
	{ label: "Tools", value: "TOOLS" },
	{ label: "Finance", value: "FINANCE" },
	{ label: "Vault", value: "VAULT" },
];

const MONTH_OPTIONS: readonly SelectOption[] = [
	{ label: "Jan", value: "1" },
	{ label: "Feb", value: "2" },
	{ label: "Mar", value: "3" },
	{ label: "Apr", value: "4" },
	{ label: "May", value: "5" },
	{ label: "Jun", value: "6" },
	{ label: "Jul", value: "7" },
	{ label: "Aug", value: "8" },
	{ label: "Sep", value: "9" },
	{ label: "Oct", value: "10" },
	{ label: "Nov", value: "11" },
	{ label: "Dec", value: "12" },
];

const TODO_REMINDER_DAYS_OPTIONS: readonly SelectOption[] = Array.from(
	{ length: 31 },
	(_, index) => {
		let label = `${index} days before`;
		if (index === 0) {
			label = "Same day";
		} else if (index === 1) {
			label = "1 day before";
		}
		return {
			label,
			value: String(index),
		};
	},
);

const TODO_REMINDER_REPEAT_HOURS_OPTIONS: readonly SelectOption[] = [
	1, 2, 3, 4, 6, 8, 12, 24,
].map((hours) => ({
	label: hours === 1 ? "Every hour" : `Every ${hours} hours`,
	value: String(hours),
}));

const getFyEndMonthLabel = (startMonth: number): string => {
	const endMonth = startMonth === 1 ? 12 : startMonth - 1;
	return MONTH_OPTIONS[endMonth - 1]?.label ?? "Mar";
};

const SettingsScreen = ({
	navigation,
}: SettingsScreenProps): React.JSX.Element => {
	const { database, refreshData } = useDatabaseContext();
	const dialog = useAppDialog();
	const [isNativeCurrency, setIsNativeCurrency] = useState(true);
	const [isWorking, setIsWorking] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [fyStartMonth, setFyStartMonth] = useState(4);
	const [defaultTripId, setDefaultTripId] = useState("");
	const [defaultHomeMode, setDefaultHomeMode] = useState<HomeMode>("TOOLS");
	const [todoRemindersEnabled, setTodoRemindersEnabled] = useState(true);
	const [todoReminderDaysBeforeDue, setTodoReminderDaysBeforeDue] =
		useState(2);
	const [todoReminderRepeatHours, setTodoReminderRepeatHours] = useState(12);
	const [trips, setTrips] = useState<readonly Trip[]>([]);
	const [reminderNotice, setReminderNotice] = useState("");
	const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(true);
	const [budgetAlertNotice, setBudgetAlertNotice] = useState("");
	const [upiDetectionEnabled, setUpiDetectionEnabled] = useState(false);
	const [hasNotificationAccess, setHasNotificationAccess] = useState(false);
	const [hasSmsPermission, setHasSmsPermission] = useState(false);
	const [upiDetectionNotice, setUpiDetectionNotice] = useState("");

	useEffect(() => {
		const getSettings = async (): Promise<void> => {
			const [
				native,
				fy,
				tripId,
				homeMode,
				reminderSettings,
				loadedTrips,
				budgetAlerts,
			] = await Promise.all([
				getNativeCurrencyDisplay(database),
				getFyStartMonth(database),
				getDefaultTripId(database),
				getDefaultHomeMode(database),
				getTodoReminderSettings(database),
				getTrips(database),
				getBudgetAlertsEnabled(database),
			]);
			setIsNativeCurrency(native);
			setFyStartMonth(fy);
			setDefaultTripId(tripId ?? "");
			setDefaultHomeMode(homeMode);
			setTodoRemindersEnabled(reminderSettings.enabled);
			setTodoReminderDaysBeforeDue(reminderSettings.daysBeforeDue);
			setTodoReminderRepeatHours(reminderSettings.repeatHours);
			setTrips(loadedTrips);
			setBudgetAlertsEnabled(budgetAlerts);
		};
		void getSettings();
	}, [database]);

	useEffect(() => {
		const getUpiDetectionSettings = async (): Promise<void> => {
			if (Platform.OS !== "android") {
				return;
			}
			try {
				const [enabled, access, smsGranted] = await Promise.all([
					getDetectionEnabled(),
					isNotificationAccessEnabled(),
					PermissionsAndroid.check("android.permission.RECEIVE_SMS"),
				]);
				setUpiDetectionEnabled(enabled);
				setHasNotificationAccess(access);
				setHasSmsPermission(smsGranted);
				setUpiDetectionNotice(
					access
						? "Detection is active in background for transaction notifications."
						: "Grant notification access so PurpleCoins can detect UPI/card alerts from all apps.",
				);
			} catch {
				setUpiDetectionNotice(
					"Unable to read detection status on this build.",
				);
			}
		};
		void getUpiDetectionSettings();
	}, []);

	const syncReminderSettings = async (): Promise<void> => {
		const result = await syncTodoReminders(database);
		if (result.permissionState === "denied") {
			setReminderNotice(
				"Allow notifications from system settings to receive todo reminders.",
			);
			return;
		}
		if (result.permissionState === "unavailable") {
			setReminderNotice(
				"Notifications dependency is not installed locally yet. Reinstall dependencies and rebuild the app to enable reminders.",
			);
			return;
		}
		if (result.permissionState === "disabled") {
			setReminderNotice("Todo reminders are turned off.");
			return;
		}
		if (result.scheduledCount > 0) {
			const reminderSuffix = result.scheduledCount === 1 ? "" : "s";
			setReminderNotice(
				`Scheduled ${result.scheduledCount} upcoming todo reminder${reminderSuffix}.`,
			);
			return;
		}
		setReminderNotice(
			"No upcoming due-date reminders to schedule right now.",
		);
	};

	const syncBudgetAlertSettings = async (): Promise<void> => {
		const result = await syncBudgetAlerts(database);
		if (result.permissionState === "denied") {
			setBudgetAlertNotice(
				"Allow notifications from system settings to receive budget alerts.",
			);
			return;
		}
		if (result.permissionState === "unavailable") {
			setBudgetAlertNotice(
				"Notifications dependency is not installed locally yet. Reinstall dependencies and rebuild the app to enable alerts.",
			);
			return;
		}
		if (result.permissionState === "disabled") {
			setBudgetAlertNotice("Budget alerts are turned off.");
			return;
		}
		if (result.notifiedCount > 0) {
			const alertSuffix = result.notifiedCount === 1 ? "" : "s";
			setBudgetAlertNotice(
				`Sent ${result.notifiedCount} new budget alert${alertSuffix}.`,
			);
			return;
		}
		setBudgetAlertNotice("No new budget alerts right now.");
	};

	const handleUpiDetectionToggle = (value: boolean): void => {
		setUpiDetectionEnabled(value);
		setDetectionEnabled(value);
		setUpiDetectionNotice(
			value
				? hasNotificationAccess
					? "Detection enabled. PurpleCoins will prompt when UPI/card notifications look like transactions."
					: "Detection enabled, but notification access is still required."
				: "Detection disabled.",
		);
	};

	const handleOpenNotificationAccess = (): void => {
		openNotificationAccessSettings();
		// Delay a quick status refresh for users who return immediately.
		setTimeout(() => {
			void (async () => {
				setHasNotificationAccess(await isNotificationAccessEnabled());
			})();
		}, 1000);
	};

	const handleRequestSmsPermission = async (): Promise<void> => {
		const result = await PermissionsAndroid.request(
			"android.permission.RECEIVE_SMS",
		);
		setHasSmsPermission(result === PermissionsAndroid.RESULTS.GRANTED);
	};

	const handleCurrencyToggle = async (value: boolean): Promise<void> => {
		setIsNativeCurrency(value);
		await updateNativeCurrencyDisplay(database, value);
		refreshData();
	};

	const handleFyStartMonthChange = async (value: string): Promise<void> => {
		const month = Number.parseInt(value, 10);
		setFyStartMonth(month);
		await updateFyStartMonth(database, month);
		refreshData();
	};

	const handleDefaultTripChange = async (value: string): Promise<void> => {
		setDefaultTripId(value);
		await updateDefaultTripId(database, value || null);
		refreshData();
	};

	const handleDefaultHomeModeChange = async (
		value: string,
	): Promise<void> => {
		const mode = value as HomeMode;
		setDefaultHomeMode(mode);
		await updateDefaultHomeMode(database, mode);
		refreshData();
	};

	const handleTodoRemindersEnabledChange = async (
		value: boolean,
	): Promise<void> => {
		setTodoRemindersEnabled(value);
		await updateTodoRemindersEnabled(database, value);
		await syncReminderSettings();
	};

	const handleTodoReminderDaysBeforeDueChange = async (
		value: string,
	): Promise<void> => {
		const days = Number.parseInt(value, 10);
		setTodoReminderDaysBeforeDue(days);
		await updateTodoReminderDaysBeforeDue(database, days);
		await syncReminderSettings();
	};

	const handleTodoReminderRepeatHoursChange = async (
		value: string,
	): Promise<void> => {
		const hours = Number.parseInt(value, 10);
		setTodoReminderRepeatHours(hours);
		await updateTodoReminderRepeatHours(database, hours);
		await syncReminderSettings();
	};

	const handleBudgetAlertsEnabledChange = async (
		value: boolean,
	): Promise<void> => {
		setBudgetAlertsEnabled(value);
		await updateBudgetAlertsEnabled(database, value);
		await syncBudgetAlertSettings();
	};

	const handleExport = async (): Promise<void> => {
		setIsWorking(true);
		setError("");
		setMessage("");
		try {
			await exportBackup(database);
			setMessage("Backup prepared successfully.");
		} catch (caughtError: unknown) {
			setError(getErrorMessage(caughtError));
		} finally {
			setIsWorking(false);
		}
	};

	const handleRestore = (): void => {
		dialog.confirm({
			title: "Restore backup?",
			message:
				"This replaces every record currently stored on this phone.",
			confirmLabel: "Choose backup",
			variant: "danger",
			onConfirm: () => {
				const processRestore = async (): Promise<void> => {
					setIsWorking(true);
					setError("");
					setMessage("");
					try {
						const wasRestored = await restoreBackup(database);
						if (wasRestored) {
							refreshData();
							setMessage("Backup restored successfully.");
						}
					} catch (caughtError: unknown) {
						setError(getErrorMessage(caughtError));
					} finally {
						setIsWorking(false);
					}
				};
				void processRestore();
			},
		});
	};

	const tripOptions: readonly SelectOption[] = [
		{ label: "None", value: "" },
		...trips.map((t) => ({ label: t.name, value: t.id })),
	];

	return (
		<ScreenContainer>
			<GlassCard>
				<View style={styles.brand}>
					<CustomText style={styles.appName}>{APP_NAME}</CustomText>
					<CustomText style={styles.version}>
						Version {version}
					</CustomText>
					<CustomText style={styles.description}>
						Local-first finance, tools and vault. No account and no
						cloud dependency.
					</CustomText>
				</View>
			</GlassCard>
			<GlassCard>
				<View style={styles.section}>
					<CustomText style={styles.heading}>Home screen</CustomText>
					<CustomText style={styles.description}>
						Choose which homepage the app opens to by default. You
						can still switch homepages anytime from the home screen.
					</CustomText>
					<SegmentedControl
						onChange={(value) =>
							void handleDefaultHomeModeChange(value)
						}
						options={HOME_MODE_OPTIONS}
						value={defaultHomeMode}
					/>
				</View>
			</GlassCard>
			<GlassCard>
				<View style={styles.section}>
					<CustomText style={styles.heading}>
						Currency display
					</CustomText>
					<View style={styles.switchRow}>
						<View style={styles.switchDetails}>
							<CustomText style={styles.switchTitle}>
								Native currencies
							</CustomText>
							<CustomText style={styles.switchDescription}>
								On shows totals per source currency. Off
								converts category and investment totals to INR.
							</CustomText>
						</View>
						<Switch
							onValueChange={(value) =>
								void handleCurrencyToggle(value)
							}
							value={isNativeCurrency}
						/>
					</View>
				</View>
			</GlassCard>
			<GlassCard>
				<View style={styles.section}>
					<CustomText style={styles.heading}>
						Configuration
					</CustomText>
					<SelectField
						label="Financial year start month"
						onChange={(value) =>
							void handleFyStartMonthChange(value)
						}
						options={MONTH_OPTIONS}
						value={String(fyStartMonth)}
					/>
					<CustomText style={styles.fyEndHint}>
						FY ends in{" "}
						<CustomText style={styles.fyEndValue}>
							{getFyEndMonthLabel(fyStartMonth)}
						</CustomText>
					</CustomText>
					<SelectField
						isOptional
						label="Default trip"
						onChange={(value) =>
							void handleDefaultTripChange(value)
						}
						options={tripOptions}
						placeholder="No default trip"
						value={defaultTripId}
					/>
					<CustomText style={styles.switchDescription}>
						When set, new transactions will have this trip
						pre-filled.
					</CustomText>
				</View>
			</GlassCard>
			<GlassCard>
				<View style={styles.section}>
					<CustomText style={styles.heading}>
						Todo reminders
					</CustomText>
					<CustomText style={styles.description}>
						Due-date reminders are scheduled locally on this device.
						The first reminder goes out at 9:00 AM on the chosen
						start day, then repeats every few hours until the due
						date ends.
					</CustomText>
					<View style={styles.switchRow}>
						<View style={styles.switchDetails}>
							<CustomText style={styles.switchTitle}>
								Enable todo reminders
							</CustomText>
							<CustomText style={styles.switchDescription}>
								Todos without a due date, completed todos and
								overdue todos are skipped automatically.
							</CustomText>
						</View>
						<Switch
							onValueChange={(value) =>
								void handleTodoRemindersEnabledChange(value)
							}
							value={todoRemindersEnabled}
						/>
					</View>
					<SelectField
						label="Start reminders"
						onChange={(value) =>
							void handleTodoReminderDaysBeforeDueChange(value)
						}
						options={TODO_REMINDER_DAYS_OPTIONS}
						value={String(todoReminderDaysBeforeDue)}
					/>
					<SelectField
						label="Repeat cadence"
						onChange={(value) =>
							void handleTodoReminderRepeatHoursChange(value)
						}
						options={TODO_REMINDER_REPEAT_HOURS_OPTIONS}
						value={String(todoReminderRepeatHours)}
					/>
					<CustomText style={styles.switchDescription}>
						Keep opening the app occasionally so future reminders
						can be refreshed within the device&apos;s
						pending-notification limit.
					</CustomText>
					{reminderNotice ? (
						<Notice message={reminderNotice} />
					) : null}
				</View>
			</GlassCard>
			<GlassCard>
				<View style={styles.section}>
					<CustomText style={styles.heading}>
						Budget alerts
					</CustomText>
					<CustomText style={styles.description}>
						Get notified locally as soon as a budget crosses 80% or
						100% of its limit for the current month or year.
					</CustomText>
					<View style={styles.switchRow}>
						<View style={styles.switchDetails}>
							<CustomText style={styles.switchTitle}>
								Enable budget alerts
							</CustomText>
							<CustomText style={styles.switchDescription}>
								Each budget only alerts once per threshold per
								period.
							</CustomText>
						</View>
						<Switch
							onValueChange={(value) =>
								void handleBudgetAlertsEnabledChange(value)
							}
							value={budgetAlertsEnabled}
						/>
					</View>
					{budgetAlertNotice ? (
						<Notice message={budgetAlertNotice} />
					) : null}
				</View>
			</GlassCard>
			{Platform.OS === "android" ? (
				<GlassCard>
					<View style={styles.section}>
						<CustomText style={styles.heading}>
							UPI/card background detection
						</CustomText>
						<CustomText style={styles.description}>
							PurpleCoins watches transaction-style notifications
							from UPI and bank/card apps, and can also read
							incoming SMS bank alerts, then asks if you want to
							add the transaction.
						</CustomText>
						<View style={styles.switchRow}>
							<View style={styles.switchDetails}>
								<CustomText style={styles.switchTitle}>
									Enable background detection
								</CustomText>
								<CustomText style={styles.switchDescription}>
									Works best when notification access is
									granted.
								</CustomText>
							</View>
							<Switch
								onValueChange={handleUpiDetectionToggle}
								value={upiDetectionEnabled}
							/>
						</View>
						<Notice
							message={`Notification access: ${hasNotificationAccess ? "Granted" : "Not granted"}`}
							tone={hasNotificationAccess ? "info" : "warning"}
						/>
						<AppButton
							icon="notifications-outline"
							label="Open notification access"
							onPress={handleOpenNotificationAccess}
							variant="secondary"
						/>
						<Notice
							message={`SMS detection: ${hasSmsPermission ? "Granted" : "Not granted"}`}
							tone={hasSmsPermission ? "info" : "warning"}
						/>
						{!hasSmsPermission ? (
							<AppButton
								icon="chatbox-outline"
								label="Grant SMS permission"
								onPress={() =>
									void handleRequestSmsPermission()
								}
								variant="secondary"
							/>
						) : null}
						{upiDetectionNotice ? (
							<Notice message={upiDetectionNotice} />
						) : null}
					</View>
				</GlassCard>
			) : null}
			<GlassCard>
				<View style={styles.section}>
					<CustomText style={styles.heading}>Relations</CustomText>
					<CustomText style={styles.description}>
						Archive recovery and category maintenance tools live
						here.
					</CustomText>
					<AppButton
						icon="shuffle-outline"
						label="Merge categories"
						onPress={() => navigation.navigate("MergeCategories")}
						variant="secondary"
					/>
					<AppButton
						icon="archive-outline"
						label="Archived relations"
						onPress={() => navigation.navigate("ArchivedRelations")}
						variant="secondary"
					/>
				</View>
			</GlassCard>
			<GlassCard>
				<View style={styles.section}>
					<CustomText style={styles.heading}>
						Backup and restore
					</CustomText>
					<CustomText style={styles.description}>
						A .purplecoins file is a plain, complete SQLite
						snapshot, including attachments. Keep it somewhere
						private.
					</CustomText>
					<AppButton
						icon="share-outline"
						isLoading={isWorking}
						label="Export .purplecoins"
						onPress={() => void handleExport()}
					/>
					<AppButton
						icon="download-outline"
						isDisabled={isWorking}
						label="Restore .purplecoins"
						onPress={handleRestore}
						variant="secondary"
					/>
				</View>
			</GlassCard>
			{message ? <Notice message={message} /> : null}
			{error ? <Notice message={error} tone="danger" /> : null}
		</ScreenContainer>
	);
};

const styles = StyleSheet.create({
	brand: {
		gap: 5,
	},
	appName: {
		color: COLORS.text,
		fontSize: 25,
		fontWeight: "900",
	},
	version: {
		color: COLORS.primaryBright,
		fontSize: 12,
		fontWeight: "800",
	},
	description: {
		color: COLORS.textMuted,
		fontSize: 13,
		lineHeight: 19,
	},
	section: {
		gap: 14,
	},
	heading: {
		color: COLORS.text,
		fontSize: 17,
		fontWeight: "900",
	},
	switchRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	switchDetails: {
		flex: 1,
		gap: 3,
	},
	switchTitle: {
		color: COLORS.text,
		fontSize: 14,
		fontWeight: "800",
	},
	switchDescription: {
		color: COLORS.textMuted,
		fontSize: 11,
		lineHeight: 16,
	},
	fyEndHint: {
		color: COLORS.textMuted,
		fontSize: 12,
		marginTop: -6,
	},
	fyEndValue: {
		color: COLORS.primaryBright,
		fontWeight: "800",
	},
});

export default SettingsScreen;
