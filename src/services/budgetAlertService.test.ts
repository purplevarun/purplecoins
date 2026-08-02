import budgetAlertService from "@/services/budgetAlertService";

import { afterEach, describe, expect, it, vi } from "vitest";

import type AnalysisSummary from "@/types/AnalysisSummary";
import type Budget from "@/types/Budget";
import type BudgetAlertState from "@/types/BudgetAlertState";
import type CategoryAnalysis from "@/types/CategoryAnalysis";

const { buildBudgetAlertCandidates } = budgetAlertService;

const BASE_BUDGET: Budget = {
	id: "budget-1",
	categoryId: "category-1",
	categoryName: "Groceries",
	amount: "1000",
	period: "MONTHLY",
	createdAt: 0,
	updatedAt: 0,
};

const EMPTY_SUMMARY: AnalysisSummary = {
	categories: [],
	investments: [],
	totalIncome: "0",
	totalExpense: "0",
	netProfit: "0",
	missingCurrencies: [],
};

const buildCategoryAnalysis = (
	overrides: Partial<CategoryAnalysis> = {},
): CategoryAnalysis => ({
	categoryId: "category-1",
	categoryName: "Groceries",
	type: "EXPENSE",
	currencyCode: "INR",
	credits: "0",
	debits: "0",
	net: "0",
	...overrides,
});

const buildSummary = (
	categories: readonly Partial<CategoryAnalysis>[],
): AnalysisSummary => ({
	...EMPTY_SUMMARY,
	categories: categories.map((category) => buildCategoryAnalysis(category)),
});

describe("buildBudgetAlertCandidates", () => {
	it("returns no candidates when there are no budgets", () => {
		expect(
			buildBudgetAlertCandidates(
				[],
				EMPTY_SUMMARY,
				EMPTY_SUMMARY,
				new Date(),
			),
		).toEqual([]);
	});

	it("returns no candidates when spend is below 80% of the budget", () => {
		const summary = buildSummary([{ debits: "700" }]);

		expect(
			buildBudgetAlertCandidates(
				[BASE_BUDGET],
				summary,
				EMPTY_SUMMARY,
				new Date(2026, 7, 15),
			),
		).toEqual([]);
	});

	it("returns an 80 threshold candidate once spend reaches 80%", () => {
		const summary = buildSummary([{ debits: "800" }]);

		const candidates = buildBudgetAlertCandidates(
			[BASE_BUDGET],
			summary,
			EMPTY_SUMMARY,
			new Date(2026, 7, 15),
		);

		expect(candidates).toEqual([
			{
				budgetId: "budget-1",
				categoryName: "Groceries",
				periodKey: "2026-08",
				threshold: 80,
			},
		]);
	});

	it("returns only a 100 threshold candidate once spend reaches the full budget", () => {
		const summary = buildSummary([{ debits: "1000" }]);

		const candidates = buildBudgetAlertCandidates(
			[BASE_BUDGET],
			summary,
			EMPTY_SUMMARY,
			new Date(2026, 7, 15),
		);

		expect(candidates).toEqual([
			{
				budgetId: "budget-1",
				categoryName: "Groceries",
				periodKey: "2026-08",
				threshold: 100,
			},
		]);
	});

	it("returns a 100 threshold candidate when spend exceeds the budget", () => {
		const summary = buildSummary([{ debits: "1500" }]);

		const candidates = buildBudgetAlertCandidates(
			[BASE_BUDGET],
			summary,
			EMPTY_SUMMARY,
			new Date(2026, 7, 15),
		);

		expect(candidates.map((candidate) => candidate.threshold)).toEqual([
			100,
		]);
	});

	it("nets credits (e.g. a refund) against debits before comparing to the budget", () => {
		const summary = buildSummary([{ debits: "1000", credits: "300" }]);

		expect(
			buildBudgetAlertCandidates(
				[BASE_BUDGET],
				summary,
				EMPTY_SUMMARY,
				new Date(2026, 7, 15),
			),
		).toEqual([]);
	});

	it("clamps negative net spend (more credits than debits) to zero", () => {
		const summary = buildSummary([{ debits: "100", credits: "500" }]);

		expect(
			buildBudgetAlertCandidates(
				[BASE_BUDGET],
				summary,
				EMPTY_SUMMARY,
				new Date(2026, 7, 15),
			),
		).toEqual([]);
	});

	it("ignores rows for a different category or currency", () => {
		const summary = buildSummary([
			{ categoryId: "other-category", debits: "5000" },
			{ currencyCode: "USD", debits: "5000" },
		]);

		expect(
			buildBudgetAlertCandidates(
				[BASE_BUDGET],
				summary,
				EMPTY_SUMMARY,
				new Date(2026, 7, 15),
			),
		).toEqual([]);
	});

	it("picks the monthly summary for a MONTHLY budget and the yearly summary for a YEARLY budget", () => {
		const yearlyBudget: Budget = {
			...BASE_BUDGET,
			id: "budget-2",
			period: "YEARLY",
		};
		const monthlySummary = buildSummary([{ debits: "1000" }]);
		const yearlySummary = buildSummary([{ debits: "800" }]);

		const candidates = buildBudgetAlertCandidates(
			[BASE_BUDGET, yearlyBudget],
			monthlySummary,
			yearlySummary,
			new Date(2026, 7, 15),
		);

		expect(candidates).toEqual([
			{
				budgetId: "budget-1",
				categoryName: "Groceries",
				periodKey: "2026-08",
				threshold: 100,
			},
			{
				budgetId: "budget-2",
				categoryName: "Groceries",
				periodKey: "2026",
				threshold: 80,
			},
		]);
	});

	it("formats a zero-padded monthly period key and a bare yearly period key", () => {
		const summary = buildSummary([{ debits: "1000" }]);

		expect(
			buildBudgetAlertCandidates(
				[BASE_BUDGET],
				summary,
				EMPTY_SUMMARY,
				new Date(2026, 0, 15),
			)[0]?.periodKey,
		).toBe("2026-01");
	});
});

describe("syncBudgetAlerts", () => {
	const database = {} as never;

	afterEach(() => {
		vi.resetModules();
		vi.doUnmock("expo-notifications");
		vi.doUnmock("react-native");
		vi.doUnmock("@/services/settingsService");
		vi.doUnmock("@/services/budgetService");
		vi.doUnmock("@/services/analysisService");
		vi.doUnmock("@/repositories/budgetAlertStateRepository");
	});

	const mockDependencies = (options: {
		enabled?: boolean;
		budgets?: readonly Budget[];
		monthlySummary?: AnalysisSummary;
		yearlySummary?: AnalysisSummary;
		alertStateRows?: readonly BudgetAlertState[];
		platformOs?: string;
		permissions?: {
			granted: boolean;
			status?: string;
			canAskAgain?: boolean;
		};
		requestedGranted?: boolean;
		reactNativeMock?: () => Record<string, unknown>;
	}): {
		setNotificationHandler: ReturnType<typeof vi.fn>;
		setNotificationChannelAsync: ReturnType<typeof vi.fn>;
		getPermissionsAsync: ReturnType<typeof vi.fn>;
		requestPermissionsAsync: ReturnType<typeof vi.fn>;
		scheduleNotificationAsync: ReturnType<typeof vi.fn>;
		upsertBudgetAlertStateRow: ReturnType<typeof vi.fn>;
		AndroidImportance: { HIGH: number };
	} => {
		const {
			enabled = true,
			budgets = [],
			monthlySummary = EMPTY_SUMMARY,
			yearlySummary = EMPTY_SUMMARY,
			alertStateRows = [],
			platformOs = "android",
			permissions = { granted: true },
			requestedGranted = true,
			reactNativeMock,
		} = options;

		const notificationsMock = {
			setNotificationHandler: vi.fn(),
			setNotificationChannelAsync: vi.fn().mockResolvedValue(undefined),
			getPermissionsAsync: vi.fn().mockResolvedValue(permissions),
			requestPermissionsAsync: vi
				.fn()
				.mockResolvedValue({ granted: requestedGranted }),
			scheduleNotificationAsync: vi.fn().mockResolvedValue("id"),
			AndroidImportance: { HIGH: 4 },
		};
		const upsertBudgetAlertStateRowMock = vi
			.fn()
			.mockResolvedValue(undefined);

		vi.doMock("expo-notifications", () => notificationsMock);
		vi.doMock(
			"react-native",
			reactNativeMock ?? (() => ({ Platform: { OS: platformOs } })),
		);
		vi.doMock("@/services/settingsService", () => ({
			default: {
				getBudgetAlertsEnabled: vi.fn().mockResolvedValue(enabled),
			},
		}));
		vi.doMock("@/services/budgetService", () => ({
			default: { getBudgets: vi.fn().mockResolvedValue(budgets) },
		}));
		vi.doMock("@/services/analysisService", () => ({
			default: {
				getAnalysisSummary: vi
					.fn()
					.mockResolvedValueOnce(monthlySummary)
					.mockResolvedValueOnce(yearlySummary),
			},
		}));
		vi.doMock("@/repositories/budgetAlertStateRepository", () => ({
			default: {
				getBudgetAlertStateRows: vi
					.fn()
					.mockResolvedValue(alertStateRows),
				upsertBudgetAlertStateRow: upsertBudgetAlertStateRowMock,
			},
		}));

		return {
			...notificationsMock,
			upsertBudgetAlertStateRow: upsertBudgetAlertStateRowMock,
		};
	};

	it("reports unavailable when expo-notifications cannot be loaded", async () => {
		vi.doMock("expo-notifications", () => {
			throw new Error("module unavailable");
		});
		vi.doMock("@/services/settingsService", () => ({
			default: {
				getBudgetAlertsEnabled: vi.fn().mockResolvedValue(true),
			},
		}));
		vi.doMock("@/services/budgetService", () => ({
			default: { getBudgets: vi.fn().mockResolvedValue([]) },
		}));
		vi.doMock("@/services/analysisService", () => ({
			default: {
				getAnalysisSummary: vi.fn().mockResolvedValue(EMPTY_SUMMARY),
			},
		}));
		vi.doMock("@/repositories/budgetAlertStateRepository", () => ({
			default: {
				getBudgetAlertStateRows: vi.fn().mockResolvedValue([]),
				upsertBudgetAlertStateRow: vi.fn().mockResolvedValue(undefined),
			},
		}));
		const { default: service } =
			await import("@/services/budgetAlertService");

		const result = await service.syncBudgetAlerts(database);

		expect(result).toEqual({
			permissionState: "unavailable",
			notifiedCount: 0,
		});
	});

	it("reports disabled when budget alerts are turned off", async () => {
		mockDependencies({ enabled: false });
		const { default: service } =
			await import("@/services/budgetAlertService");

		const result = await service.syncBudgetAlerts(database);

		expect(result).toEqual({
			permissionState: "disabled",
			notifiedCount: 0,
		});
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
			await import("@/services/budgetAlertService");

		const result = await service.syncBudgetAlerts(database);

		expect(result).toEqual({ permissionState: "denied", notifiedCount: 0 });
	});

	it("reports granted with no notifications when no budget has crossed a threshold", async () => {
		mockDependencies({
			budgets: [BASE_BUDGET],
			monthlySummary: buildSummary([{ debits: "100" }]),
		});
		const { default: service } =
			await import("@/services/budgetAlertService");

		const result = await service.syncBudgetAlerts(database);

		expect(result).toEqual({
			permissionState: "granted",
			notifiedCount: 0,
		});
	});

	it("requests permission when not yet granted and notifies once a budget crosses a threshold", async () => {
		const notifications = mockDependencies({
			permissions: {
				granted: false,
				status: "undetermined",
				canAskAgain: true,
			},
			requestedGranted: true,
			budgets: [BASE_BUDGET],
			monthlySummary: buildSummary([{ debits: "1000" }]),
		});
		const { default: service } =
			await import("@/services/budgetAlertService");

		const result = await service.syncBudgetAlerts(database);

		expect(result).toEqual({
			permissionState: "granted",
			notifiedCount: 1,
		});
		expect(notifications.requestPermissionsAsync).toHaveBeenCalled();
		expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
			expect.objectContaining({ trigger: null }),
		);
		expect(notifications.upsertBudgetAlertStateRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				budgetId: "budget-1",
				threshold: 100,
			}),
		);
	});

	it("sends the 'nearly used up' notification content for an 80% threshold", async () => {
		const notifications = mockDependencies({
			budgets: [BASE_BUDGET],
			monthlySummary: buildSummary([{ debits: "800" }]),
		});
		const { default: service } =
			await import("@/services/budgetAlertService");

		const result = await service.syncBudgetAlerts(database);

		expect(result).toEqual({
			permissionState: "granted",
			notifiedCount: 1,
		});
		expect(notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				content: expect.objectContaining({
					title: "Budget nearly used up",
				}),
			}),
		);
	});

	it("does not re-notify a threshold already recorded for the current period", async () => {
		const notifications = mockDependencies({
			budgets: [BASE_BUDGET],
			monthlySummary: buildSummary([{ debits: "1000" }]),
			alertStateRows: [
				{
					id: "state-1",
					budgetId: "budget-1",
					periodKey: "2026-08",
					threshold: 100,
					notifiedAt: 1,
				},
			],
		});
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 7, 15));
		const { default: service } =
			await import("@/services/budgetAlertService");

		const result = await service.syncBudgetAlerts(database);
		vi.useRealTimers();

		expect(result).toEqual({
			permissionState: "granted",
			notifiedCount: 0,
		});
		expect(notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
	});

	it("skips the android notification channel setup on non-android platforms", async () => {
		const notifications = mockDependencies({ platformOs: "ios" });
		const { default: service } =
			await import("@/services/budgetAlertService");

		await service.syncBudgetAlerts(database);

		expect(
			notifications.setNotificationChannelAsync,
		).not.toHaveBeenCalled();
	});

	it("only configures the notification handler once across multiple syncs", async () => {
		const notifications = mockDependencies({});
		const { default: service } =
			await import("@/services/budgetAlertService");

		await service.syncBudgetAlerts(database);
		await service.syncBudgetAlerts(database);

		expect(notifications.setNotificationHandler).toHaveBeenCalledTimes(1);
	});

	it("configures a notification handler that resolves with the expected presentation options", async () => {
		const notifications = mockDependencies({});
		const { default: service } =
			await import("@/services/budgetAlertService");

		await service.syncBudgetAlerts(database);

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
		const notifications = mockDependencies({
			reactNativeMock: () => {
				throw new Error("react-native unavailable");
			},
		});
		const { default: service } =
			await import("@/services/budgetAlertService");

		await service.syncBudgetAlerts(database);

		expect(
			notifications.setNotificationChannelAsync,
		).not.toHaveBeenCalled();
	});
});
