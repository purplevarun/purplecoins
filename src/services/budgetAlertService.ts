import budgetAlertStateRepository from "@/repositories/budgetAlertStateRepository";
import analysisService from "@/services/analysisService";
import budgetService from "@/services/budgetService";
import settingsService from "@/services/settingsService";

import Decimal from "decimal.js";

import appConstants from "@/constants/appConstants";
import type AnalysisSummary from "@/types/AnalysisSummary";
import type Budget from "@/types/Budget";
import type BudgetPeriod from "@/types/BudgetPeriod";
import dateUtils from "@/utils/date";
import createId from "@/utils/id";
import moneyUtils from "@/utils/money";
import type * as ExpoNotifications from "expo-notifications";
import type { SQLiteDatabase } from "expo-sqlite";

const { DEFAULT_CURRENCY_CODE } = appConstants;
const { getAnalysisDateRange } = dateUtils;
const { compareMoney, subtractMoney, ZERO_AMOUNT } = moneyUtils;
const { getAnalysisSummary } = analysisService;
const { getBudgets } = budgetService;
const { getBudgetAlertsEnabled } = settingsService;
const { getBudgetAlertStateRows, upsertBudgetAlertStateRow } =
	budgetAlertStateRepository;

const BUDGET_ALERT_OWNER_TYPE = "BUDGET_ALERT";
const BUDGET_ALERT_CHANNEL_ID = "budget-alerts";
const BUDGET_ALERT_THRESHOLD_HIGH = 100;
const BUDGET_ALERT_THRESHOLD_LOW = 80;

let notificationHandlerConfigured = false;

type NotificationsModule = typeof ExpoNotifications;

type BudgetAlertThreshold =
	typeof BUDGET_ALERT_THRESHOLD_LOW | typeof BUDGET_ALERT_THRESHOLD_HIGH;

type BudgetAlertPermissionState =
	"granted" | "denied" | "disabled" | "unavailable";

type BudgetAlertCandidate = Readonly<{
	budgetId: string;
	categoryName: string;
	periodKey: string;
	threshold: BudgetAlertThreshold;
}>;

type BudgetAlertSyncResult = Readonly<{
	permissionState: BudgetAlertPermissionState;
	notifiedCount: number;
}>;

const getPeriodKey = (period: BudgetPeriod, now: Date): string =>
	period === "MONTHLY"
		? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
		: String(now.getFullYear());

const getSpentAmount = (
	summary: AnalysisSummary,
	categoryId: string,
): string => {
	const rows = summary.categories.filter(
		(category) =>
			category.categoryId === categoryId &&
			category.currencyCode === DEFAULT_CURRENCY_CODE,
	);
	const netSpent = rows.reduce(
		(total, row) =>
			subtractMoney(total, subtractMoney(row.credits, row.debits)),
		ZERO_AMOUNT,
	);
	return compareMoney(netSpent, ZERO_AMOUNT) > 0 ? netSpent : ZERO_AMOUNT;
};

const getCrossedThreshold = (
	spentAmount: string,
	budgetAmount: string,
): BudgetAlertThreshold | null => {
	const percentUsed = new Decimal(spentAmount)
		.dividedBy(budgetAmount)
		.times(100);
	if (percentUsed.greaterThanOrEqualTo(BUDGET_ALERT_THRESHOLD_HIGH)) {
		return BUDGET_ALERT_THRESHOLD_HIGH;
	}
	if (percentUsed.greaterThanOrEqualTo(BUDGET_ALERT_THRESHOLD_LOW)) {
		return BUDGET_ALERT_THRESHOLD_LOW;
	}
	return null;
};

const buildBudgetAlertCandidates = (
	budgets: readonly Budget[],
	monthlySummary: AnalysisSummary,
	yearlySummary: AnalysisSummary,
	now: Date,
): readonly BudgetAlertCandidate[] =>
	budgets.flatMap((budget) => {
		const summary =
			budget.period === "MONTHLY" ? monthlySummary : yearlySummary;
		const spentAmount = getSpentAmount(summary, budget.categoryId);
		const threshold = getCrossedThreshold(spentAmount, budget.amount);
		if (threshold === null) {
			return [];
		}
		return [
			{
				budgetId: budget.id,
				categoryName: budget.categoryName,
				periodKey: getPeriodKey(budget.period, now),
				threshold,
			},
		];
	});

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
	await notifications.setNotificationChannelAsync(BUDGET_ALERT_CHANNEL_ID, {
		name: "Budget alerts",
		importance: notifications.AndroidImportance.HIGH,
		lightColor: "#A87CFF",
		vibrationPattern: [0, 250, 250, 250],
	});
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

const isAlreadyNotified = async (
	database: SQLiteDatabase,
	candidate: BudgetAlertCandidate,
): Promise<boolean> => {
	const rows = await getBudgetAlertStateRows(
		database,
		candidate.budgetId,
		candidate.periodKey,
	);
	return rows.some((row) => row.threshold === candidate.threshold);
};

const getAlertContent = (
	candidate: BudgetAlertCandidate,
): Readonly<{ title: string; body: string }> => ({
	title:
		candidate.threshold === BUDGET_ALERT_THRESHOLD_HIGH
			? "Budget exceeded"
			: "Budget nearly used up",
	body: `${candidate.categoryName} has used ${candidate.threshold}% of its budget.`,
});

const notifyBudgetAlertCandidate = async (
	database: SQLiteDatabase,
	notifications: NotificationsModule,
	candidate: BudgetAlertCandidate,
): Promise<boolean> => {
	if (await isAlreadyNotified(database, candidate)) {
		return false;
	}
	const { title, body } = getAlertContent(candidate);
	await notifications.scheduleNotificationAsync({
		content: {
			title,
			body,
			data: {
				ownerType: BUDGET_ALERT_OWNER_TYPE,
				budgetId: candidate.budgetId,
			},
			sound: true,
		},
		trigger: null,
	});
	await upsertBudgetAlertStateRow(database, {
		id: createId(),
		budgetId: candidate.budgetId,
		periodKey: candidate.periodKey,
		threshold: candidate.threshold,
		notifiedAt: Date.now(),
	});
	return true;
};

const syncBudgetAlerts = async (
	database: SQLiteDatabase,
): Promise<BudgetAlertSyncResult> => {
	const notifications = await loadNotificationsModule();
	if (!notifications) {
		return { permissionState: "unavailable", notifiedCount: 0 };
	}

	ensureNotificationHandlerConfigured(notifications);
	await ensureAndroidChannel(notifications);

	if (!(await getBudgetAlertsEnabled(database))) {
		return { permissionState: "disabled", notifiedCount: 0 };
	}

	const hasPermission = await ensureNotificationPermissions(notifications);
	if (!hasPermission) {
		return { permissionState: "denied", notifiedCount: 0 };
	}

	const now = new Date();
	const [budgets, monthlySummary, yearlySummary] = await Promise.all([
		getBudgets(database),
		getAnalysisSummary(database, {
			dateRange: getAnalysisDateRange("MONTH", now),
			isNativeCurrency: false,
		}),
		getAnalysisSummary(database, {
			dateRange: getAnalysisDateRange("YEAR", now),
			isNativeCurrency: false,
		}),
	]);

	const candidates = buildBudgetAlertCandidates(
		budgets,
		monthlySummary,
		yearlySummary,
		now,
	);
	const results = await Promise.all(
		candidates.map((candidate) =>
			notifyBudgetAlertCandidate(database, notifications, candidate),
		),
	);
	return {
		permissionState: "granted",
		notifiedCount: results.filter(Boolean).length,
	};
};

const budgetAlertService = {
	buildBudgetAlertCandidates,
	syncBudgetAlerts,
};

export type { BudgetAlertSyncResult };
export default budgetAlertService;
