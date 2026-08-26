import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getTransactionMinMaxDate: vi.fn(),
	getAnalysisSummary: vi.fn(),
	getInvestmentNetAmount: vi.fn(),
	getInvestmentNetLabel: vi.fn(),
	getFyStartMonth: vi.fn(),
	getAnalysisDateRange: vi.fn(),
	getCustomDateRange: vi.fn(),
	shiftAnalysisAnchor: vi.fn(),
	absoluteMoney: vi.fn(),
	addMoney: vi.fn(),
	compareMoney: vi.fn(),
	formatMoney: vi.fn(),
	subtractMoney: vi.fn(),
	sumMoney: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useCallback: reactMocks.useCallback,
		useEffect: reactMocks.useEffect,
		useMemo: reactMocks.useMemo,
		useState: reactMocks.useState,
	};
});

vi.mock("@expo/vector-icons", () => ({
	Ionicons: (props: any) => ({ type: "Ionicons", props }),
}));

vi.mock("react-native", () => ({
	Pressable: (props: any) => ({ type: "Pressable", props }),
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));
vi.mock("@/components/DateField", () => ({
	default: (props: any) => ({ type: "DateField", props }),
}));
vi.mock("@/components/DonutChart", () => ({
	default: (props: any) => ({ type: "DonutChart", props }),
}));
vi.mock("@/components/EmptyState", () => ({
	default: (props: any) => ({ type: "EmptyState", props }),
}));
vi.mock("@/components/GlassCard", () => ({
	default: (props: any) => ({ type: "GlassCard", props }),
}));
vi.mock("@/components/Notice", () => ({
	default: (props: any) => ({ type: "Notice", props }),
}));
vi.mock("@/components/ScreenContainer", () => ({
	default: (props: any) => ({ type: "ScreenContainer", props }),
}));
vi.mock("@/components/SectionHeading", () => ({
	default: (props: any) => ({ type: "SectionHeading", props }),
}));
vi.mock("@/components/SegmentedControl", () => ({
	default: (props: any) => ({ type: "SegmentedControl", props }),
}));

vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({ database: { id: "db" }, dataVersion: 1 }),
}));

vi.mock("@/repositories/financeRepository", () => ({
	default: { getTransactionMinMaxDate: serviceMocks.getTransactionMinMaxDate },
}));
vi.mock("@/services/analysisService", () => ({
	default: {
		getAnalysisSummary: serviceMocks.getAnalysisSummary,
		getInvestmentNetAmount: serviceMocks.getInvestmentNetAmount,
		getInvestmentNetLabel: serviceMocks.getInvestmentNetLabel,
	},
}));
vi.mock("@/services/settingsService", () => ({
	default: { getFyStartMonth: serviceMocks.getFyStartMonth },
}));
vi.mock("@/utils/date", () => ({
	default: {
		formatDate: (value: number) => `date:${value}`,
		getAnalysisDateRange: serviceMocks.getAnalysisDateRange,
		getCustomDateRange: serviceMocks.getCustomDateRange,
		shiftAnalysisAnchor: serviceMocks.shiftAnalysisAnchor,
	},
}));
vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/money", () => ({
	default: {
		absoluteMoney: serviceMocks.absoluteMoney,
		addMoney: serviceMocks.addMoney,
		compareMoney: serviceMocks.compareMoney,
		formatMoney: serviceMocks.formatMoney,
		subtractMoney: serviceMocks.subtractMoney,
		sumMoney: serviceMocks.sumMoney,
		ZERO_AMOUNT: "0",
	},
}));
vi.mock("@/utils/runAfterRender", () => ({
	default: (fn: () => void) => fn(),
}));

import COLORS from "@/constants/colors";
import AnalysisScreen, {
	HAS_ARROWS,
	formatSignedMoney,
	getChartData,
	getCategoryAccent,
	getCategoryBucketLabel,
	getCategoryNetColor,
	getInvestmentAccent,
	getInvestmentColor,
	getLinkedCategoryParams,
	getLinkedInvestmentParams,
	getPeriodTitle,
	getSelectedDateRange,
	getSummaryMetrics,
	isShiftNavigationDisabled,
} from "@/screens/AnalysisScreen";

const flush = async (): Promise<void> => {
	await Promise.resolve();
	await Promise.resolve();
};

const findByPredicate = (
	node: any,
	predicate: (candidate: any) => boolean,
	acc: any[] = [],
): any[] => {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((child) => findByPredicate(child, predicate, acc));
		return acc;
	}
	if (predicate(node)) acc.push(node);
	if (node.props) {
		Object.values(node.props).forEach((value) =>
			findByPredicate(value, predicate, acc),
		);
	}
	return acc;
};

describe("AnalysisScreen", () => {
	beforeEach(() => {
		reactMocks.useEffect.mockReset();
		reactMocks.useState.mockReset();
		reactMocks.useEffect.mockImplementation((effect: () => void) => {
			effect();
		});
		reactMocks.useState.mockImplementation((initial: any) => [
			typeof initial === "function" ? initial() : initial,
			vi.fn(),
		]);

		Object.values(serviceMocks).forEach((mockFn) => mockFn.mockReset());
		serviceMocks.getAnalysisDateRange.mockReturnValue({ start: 1, end: 31 });
		serviceMocks.getCustomDateRange.mockReturnValue({ start: 5, end: 15 });
		serviceMocks.shiftAnalysisAnchor.mockImplementation((_: any, prev: Date) => prev);
		serviceMocks.getTransactionMinMaxDate.mockResolvedValue({ minDate: 1, maxDate: 31 });
		serviceMocks.getAnalysisSummary.mockResolvedValue({
			missingCurrencies: [],
			totalIncome: "1000",
			totalExpense: "400",
			netProfit: "600",
			categories: [
				{
					categoryId: "c1",
					categoryName: "Food",
					currencyCode: "INR",
					credits: "100",
					debits: "300",
					net: "-200",
					isIncome: false,
				},
			],
			investments: [
				{
					investmentId: "i1",
					investmentName: "MF",
					currencyCode: "INR",
					totalInvested: "500",
					totalRedeemed: "100",
					net: "400",
				},
			],
		});
		serviceMocks.getFyStartMonth.mockResolvedValue(4);
		serviceMocks.getInvestmentNetAmount.mockImplementation((value: string) => value);
		serviceMocks.getInvestmentNetLabel.mockReturnValue("Net");
		serviceMocks.absoluteMoney.mockImplementation((value: string) => value.replace("-", ""));
		serviceMocks.addMoney.mockImplementation((a: string, b: string) => String(Number(a) + Number(b)));
		serviceMocks.compareMoney.mockImplementation((a: string, b: string) => Number(a) - Number(b));
		serviceMocks.formatMoney.mockImplementation((amount: string, currency: string) => `${currency} ${amount}`);
		serviceMocks.subtractMoney.mockImplementation((a: string, b: string) => String(Number(a) - Number(b)));
		serviceMocks.sumMoney.mockReturnValue("400");
	});

	it("renders default summary mode and navigates from category, investment and rates links", async () => {
		const navigation = { navigate: vi.fn() };
		const anchorSetter = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 2) return [new Date("2026-01-01T00:00:00.000Z"), anchorSetter];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		expect(serviceMocks.getAnalysisSummary).toHaveBeenCalledWith({ id: "db" }, {
			dateRange: { start: 1, end: 31 },
			isNativeCurrency: false,
		});

		const segmented = findByPredicate(tree, (node) => typeof node?.props?.onChange === "function")[0];
		segmented.props.onChange("YEAR");

		findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				Object.prototype.hasOwnProperty.call(node?.props ?? {}, "disabled"),
		).forEach((node) => node.props.onPress());
		findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				node?.props?.style === undefined,
		).forEach((node) => node.props.onPress());
		findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				JSON.stringify(node).includes("Manage exchange rates"),
		)[0]?.props?.onPress();
		findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				JSON.stringify(node).includes("Food"),
		).forEach((node) => node.props.onPress());
		findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				JSON.stringify(node).includes("MF"),
		).forEach((node) => node.props.onPress());
		await flush();

		expect(anchorSetter).toHaveBeenCalled();
		expect(navigation.navigate).toHaveBeenCalledWith("ExchangeRates");
	});

	it("renders missing-currency branch and exchange-rate shortcut", async () => {
		serviceMocks.getAnalysisSummary.mockResolvedValue({
			missingCurrencies: ["USD"],
			totalIncome: "0",
			totalExpense: "0",
			netProfit: "0",
			categories: [],
			investments: [],
		});
		const navigation = { navigate: vi.fn() };
		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => node.props.onPress());

		expect(navigation.navigate).toHaveBeenCalledWith("ExchangeRates");
	});

	it("renders custom period controls when period is CUSTOM", async () => {
		const navigation = { navigate: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["CUSTOM", vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.label === "From" || node?.props?.label === "To",
			),
		).toHaveLength(2);
	});

	it("renders ALL period notice with empty analysis states", async () => {
		serviceMocks.getAnalysisSummary.mockResolvedValue({
			missingCurrencies: [],
			totalIncome: "0",
			totalExpense: "0",
			netProfit: "0",
			categories: [],
			investments: [],
		});
		const navigation = { navigate: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["ALL", vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		expect(
			findByPredicate(
				tree,
				(node) =>
					String(JSON.stringify(node) ?? "").includes(
						"Showing every transaction and category stored locally.",
					),
			),
		).not.toHaveLength(0);
		expect(
			findByPredicate(
				tree,
				(node) =>
					String(JSON.stringify(node) ?? "").includes(
						"Nothing to analyse",
					),
			),
		).not.toHaveLength(0);
		expect(
			findByPredicate(
				tree,
				(node) =>
					String(JSON.stringify(node) ?? "").includes(
						"No investment activity",
					),
			),
		).not.toHaveLength(0);
	});

	it("renders YTD title branch", async () => {
		const navigation = { navigate: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["YTD", vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		expect(
			findByPredicate(
				tree,
				(node) =>
					String(JSON.stringify(node) ?? "").includes(
						"Year to Date",
					),
			),
		).not.toHaveLength(0);
	});

	it("covers AnalysisScreen helper branches directly", () => {
		const anchorDate = new Date("2026-04-10T00:00:00.000Z");

		expect(HAS_ARROWS).toEqual(["MONTH", "YEAR", "FY"]);
		expect(
			getSelectedDateRange({
				period: "CUSTOM",
				anchorDate,
				customStartAt: 11,
				customEndAt: 22,
				fyStartMonth: 4,
			}),
		).toEqual({ start: 5, end: 15 });
		expect(
			getSelectedDateRange({
				period: "MONTH",
				anchorDate,
				customStartAt: 11,
				customEndAt: 22,
				fyStartMonth: 4,
			}),
		).toEqual({ start: 1, end: 31 });

		expect(getPeriodTitle("MONTH", anchorDate, 4)).toContain("April");
		expect(getPeriodTitle("YEAR", anchorDate, 4)).toBe("2026");
		expect(getPeriodTitle("FY", anchorDate, 4)).toBe("FY 2026–27");
		expect(getPeriodTitle("YTD", anchorDate, 4)).toBe("Year to Date");
		expect(getPeriodTitle("ALL", anchorDate, 4)).toBe("All transactions");
		expect(getPeriodTitle("CUSTOM", anchorDate, 4)).toBe("Custom period");

		expect(formatSignedMoney("20")).toBe("+INR 20");
		expect(formatSignedMoney("0")).toBe("INR 0");
		expect(getInvestmentColor("20")).toBe(COLORS.danger);
		expect(getInvestmentColor("-20")).toBe(COLORS.success);
		expect(getInvestmentColor("0")).toBe(COLORS.text);
		expect(getInvestmentAccent("20")).toBe("danger");
		expect(getInvestmentAccent("-20")).toBe("success");
		expect(getInvestmentAccent("0")).toBe("default");
		expect(isShiftNavigationDisabled("MONTH", anchorDate, -1, undefined, 10)).toBe(
			false,
		);
		expect(isShiftNavigationDisabled("MONTH", anchorDate, 1, 1, undefined)).toBe(
			false,
		);
		expect(isShiftNavigationDisabled("MONTH", anchorDate, -1, 1, 10)).toBe(true);
		expect(isShiftNavigationDisabled("MONTH", anchorDate, 1, 1, 10)).toBe(true);
		expect(getCategoryAccent("1")).toBe("success");
		expect(getCategoryAccent("-1")).toBe("danger");
		expect(getCategoryBucketLabel(true)).toBe("Income category");
		expect(getCategoryBucketLabel(false)).toBe("Expense category");
		expect(getCategoryNetColor("1")).toBe(COLORS.success);
		expect(getCategoryNetColor("-1")).toBe(COLORS.danger);
		expect(
			getLinkedCategoryParams(
				{
					categoryId: "c1",
					categoryName: "Food",
					currencyCode: "INR",
					credits: "1",
					debits: "2",
					net: "-1",
					isIncome: false,
				},
				{ start: 1, end: 2 },
			),
		).toEqual({
			kind: "CATEGORY",
			entityId: "c1",
			entityName: "Food",
			dateRangeStart: 1,
			dateRangeEnd: 2,
			dateRangeLabel: "date:1 – date:2",
		});
		expect(
			getLinkedInvestmentParams(
				{
					investmentId: "i1",
					investmentName: "MF",
					currencyCode: "INR",
					totalInvested: "5",
					totalRedeemed: "2",
					net: "3",
				},
				{ start: 1, end: 2 },
			),
		).toEqual({
			kind: "INVESTMENT",
			entityId: "i1",
			entityName: "MF",
			dateRangeStart: 1,
			dateRangeEnd: 2,
			dateRangeLabel: "date:1 – date:2",
		});

		expect(getChartData(null, true)).toEqual([]);
		expect(
			getChartData(
				{
					missingCurrencies: [],
					totalIncome: "0",
					totalExpense: "0",
					netProfit: "0",
					categories: [
						{
							categoryId: "c1",
							categoryName: "Food",
							currencyCode: "INR",
							credits: "1",
							debits: "2",
							net: "-1",
							isIncome: false,
						},
						{
							categoryId: "c2",
							categoryName: "Zero",
							currencyCode: "INR",
							credits: "0",
							debits: "0",
							net: "0",
							isIncome: false,
						},
					],
					investments: [],
				},
				false,
			),
		).toEqual([{ label: "Food", value: 1, color: "#A87CFF" }]);

		expect(
			getSummaryMetrics(
				{
					missingCurrencies: [],
					totalIncome: "100",
					totalExpense: "80",
					netProfit: "20",
					categories: [],
					investments: [],
				},
				"-40",
				"40",
				"-20",
			).map((metric) => metric.label),
		).toEqual([
			"Income",
			"Expenses",
			"Investments",
			"Net",
			"Net after investments",
		]);
	});
});
