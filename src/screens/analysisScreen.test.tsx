import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getTransactionMinMaxDate: vi.fn(),
	getTransactionRows: vi.fn(),
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
vi.mock("react-native-svg", () => ({
	default: (props: any) => ({ type: "Svg", props }),
	Line: (props: any) => ({ type: "Line", props }),
	Polyline: (props: any) => ({ type: "Polyline", props }),
}));
vi.mock("@/components/TrendLineChart", () => ({
	default: (props: any) => ({ type: "TrendLineChart", props }),
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
	default: {
		getTransactionMinMaxDate: serviceMocks.getTransactionMinMaxDate,
		getTransactionRows: serviceMocks.getTransactionRows,
	},
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
	getDateRangeLabel,
	getInvestmentColor,
	getMissingRatesMessage,
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
		serviceMocks.getAnalysisDateRange.mockReturnValue({
			start: 1,
			end: 31,
		});
		serviceMocks.getCustomDateRange.mockReturnValue({ start: 5, end: 15 });
		serviceMocks.shiftAnalysisAnchor.mockImplementation(
			(_: any, prev: Date) => prev,
		);
		serviceMocks.getTransactionMinMaxDate.mockResolvedValue({
			minDate: 1,
			maxDate: 31,
		});
		serviceMocks.getTransactionRows.mockResolvedValue([
			{
				id: "t1",
				classification: "GENERAL",
				type: "CREDIT",
				categoryId: "c1",
				amount: "100",
				transactionAt: new Date("2024-01-15").getTime(),
			},
		]);
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
		serviceMocks.getInvestmentNetAmount.mockImplementation(
			(value: string) => value,
		);
		serviceMocks.getInvestmentNetLabel.mockReturnValue("Net");
		serviceMocks.absoluteMoney.mockImplementation((value: string) =>
			value.replace("-", ""),
		);
		serviceMocks.addMoney.mockImplementation((a: string, b: string) =>
			String(Number(a) + Number(b)),
		);
		serviceMocks.compareMoney.mockImplementation(
			(a: string, b: string) => Number(a) - Number(b),
		);
		serviceMocks.formatMoney.mockImplementation(
			(amount: string, currency: string) => `${currency} ${amount}`,
		);
		serviceMocks.subtractMoney.mockImplementation((a: string, b: string) =>
			String(Number(a) - Number(b)),
		);
		serviceMocks.sumMoney.mockReturnValue("400");
	});

	it("renders default summary mode and navigates from category, investment and rates links", async () => {
		const navigation = { navigate: vi.fn() };
		const anchorSetter = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 2)
				return [new Date("2026-01-01T00:00:00.000Z"), anchorSetter];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		expect(serviceMocks.getAnalysisSummary).toHaveBeenCalledWith(
			{ id: "db" },
			{
				dateRange: { start: 1, end: 31 },
				isNativeCurrency: false,
			},
		);
		expect(serviceMocks.getTransactionRows).toHaveBeenCalledWith({
			id: "db",
		});

		const segmented = findByPredicate(
			tree,
			(node) => typeof node?.props?.onChange === "function",
		)[0];
		segmented.props.onChange("YEAR");

		findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				Object.prototype.hasOwnProperty.call(
					node?.props ?? {},
					"disabled",
				),
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
				JSON.stringify(node).includes("See all categories"),
		)[0]?.props?.onPress();
		findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				JSON.stringify(node).includes("See all investments"),
		)[0]?.props?.onPress();
		await flush();

		expect(anchorSetter).toHaveBeenCalled();
		expect(navigation.navigate).toHaveBeenCalledWith("ExchangeRates");
		expect(navigation.navigate).toHaveBeenCalledWith(
			"AnalysisDetails",
			expect.objectContaining({ mode: "CATEGORIES" }),
		);
		expect(navigation.navigate).toHaveBeenCalledWith(
			"AnalysisDetails",
			expect.objectContaining({ mode: "INVESTMENTS" }),
		);
	});

	it("renders missing-currency branch and exchange-rate shortcut", async () => {
		const navigation = { navigate: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 5) {
				return [
					{
						missingCurrencies: ["USD"],
						totalIncome: "0",
						totalExpense: "0",
						netProfit: "0",
						categories: [],
						investments: [],
					},
					vi.fn(),
				];
			}
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

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
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		expect(
			findByPredicate(
				tree,
				(node) =>
					node?.props?.label === "From" ||
					node?.props?.label === "To",
			),
		).toHaveLength(2);
	});

	it("renders ALL period notice with empty analysis and trend states", async () => {
		serviceMocks.getAnalysisSummary.mockResolvedValue({
			missingCurrencies: [],
			totalIncome: "0",
			totalExpense: "0",
			netProfit: "0",
			categories: [],
			investments: [],
		});
		serviceMocks.getTransactionRows.mockResolvedValue([]);
		const navigation = { navigate: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["ALL", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		expect(
			findByPredicate(tree, (node) =>
				String(JSON.stringify(node) ?? "").includes(
					"Showing every transaction and category stored locally.",
				),
			),
		).toHaveLength(0);
		expect(
			findByPredicate(tree, (node) =>
				String(JSON.stringify(node) ?? "").includes(
					"See all categories",
				),
			),
		).not.toHaveLength(0);
		expect(
			findByPredicate(tree, (node) =>
				String(JSON.stringify(node) ?? "").includes(
					"See all investments",
				),
			),
		).not.toHaveLength(0);
		expect(
			findByPredicate(tree, (node) =>
				String(JSON.stringify(node) ?? "").includes(
					"Nothing to analyse",
				),
			),
		).not.toHaveLength(0);
		expect(
			findByPredicate(tree, (node) =>
				String(JSON.stringify(node) ?? "").includes("No trend data"),
			),
		).not.toHaveLength(0);
	});

	it("renders YTD title branch", async () => {
		const navigation = { navigate: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["YTD", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		expect(
			findByPredicate(tree, (node) =>
				String(JSON.stringify(node) ?? "").includes("Year to Date"),
			),
		).not.toHaveLength(0);
	});

	it("covers load-error catch branch and period arrow updater callbacks", async () => {
		const navigation = { navigate: vi.fn() };
		serviceMocks.getAnalysisSummary.mockRejectedValueOnce(
			new Error("analysis failed"),
		);

		const anchorSetter = vi.fn((updater: (prev: Date) => Date) => {
			updater(new Date("2026-01-01T00:00:00.000Z"));
		});
		const setError = vi.fn();

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 2)
				return [new Date("2026-01-01T00:00:00.000Z"), anchorSetter];
			if (stateCall === 6) return ["", setError];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();
		await flush();

		expect(setError).toHaveBeenCalledWith("analysis failed");

		const arrowButtons = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				Object.prototype.hasOwnProperty.call(
					node?.props ?? {},
					"disabled",
				),
		);
		expect(arrowButtons).toHaveLength(2);
		arrowButtons[0].props.onPress();
		arrowButtons[1].props.onPress();

		expect(serviceMocks.shiftAnalysisAnchor).toHaveBeenCalledWith(
			"MONTH",
			expect.any(Date),
			-1,
			undefined,
			undefined,
		);
		expect(serviceMocks.shiftAnalysisAnchor).toHaveBeenCalledWith(
			"MONTH",
			expect.any(Date),
			1,
			undefined,
			undefined,
		);
	});

	it("fetches trends independent of the selected analysis period", async () => {
		const navigation = { navigate: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["YEAR", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		AnalysisScreen({ navigation } as any);
		await flush();

		expect(serviceMocks.getTransactionRows).toHaveBeenCalledWith({
			id: "db",
		});
		expect(serviceMocks.getTransactionRows).not.toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			expect.anything(),
		);
	});

	it("renders the trend chart when trend data is available", async () => {
		const navigation = { navigate: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 10) {
				return [
					[
						{
							id: "t1",
							classification: "GENERAL",
							type: "CREDIT",
							categoryId: "c1",
							amount: "100",
							transactionAt: new Date("2024-01-15").getTime(),
						},
					],
					vi.fn(),
				];
			}
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		expect(
			findByPredicate(
				tree,
				(node) => typeof node?.props?.series !== "undefined",
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
		expect(
			getPeriodTitle("FY", new Date("2026-01-10T00:00:00.000Z"), 4),
		).toBe("FY 2025–26");
		expect(getPeriodTitle("YTD", anchorDate, 4)).toBe("Year to Date");
		expect(getPeriodTitle("ALL", anchorDate, 4)).toBe("All transactions");
		expect(getPeriodTitle("CUSTOM", anchorDate, 4)).toBe("Custom period");

		expect(formatSignedMoney("20")).toBe("+INR 20");
		expect(formatSignedMoney("0")).toBe("INR 0");
		expect(getInvestmentColor("20")).toBe(COLORS.danger);
		expect(getInvestmentColor("-20")).toBe(COLORS.success);
		expect(getInvestmentColor("0")).toBe(COLORS.text);
		expect(
			isShiftNavigationDisabled("MONTH", anchorDate, -1, undefined, 10),
		).toBe(false);
		expect(
			isShiftNavigationDisabled("MONTH", anchorDate, 1, 1, undefined),
		).toBe(false);
		expect(isShiftNavigationDisabled("MONTH", anchorDate, -1, 1, 10)).toBe(
			true,
		);
		expect(isShiftNavigationDisabled("MONTH", anchorDate, 1, 1, 10)).toBe(
			true,
		);
		expect(getDateRangeLabel({ start: 1, end: 2 })).toBe("date:1 – date:2");
		expect(getMissingRatesMessage(["USD", "EUR"])).toBe(
			"Update INR exchange rates for USD, EUR before analysis can include those transactions.",
		);

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

		const fallbackColorData = getChartData(
			{
				categories: {
					filter: () => ({
						slice: () => ({
							map: (
								mapper: (
									category: any,
									index: number,
								) => unknown,
							) => [
								mapper(
									{
										categoryName: "Fallback",
										net: "1",
									},
									999,
								),
							],
						}),
					}),
				} as any,
			} as any,
			false,
		);
		expect(fallbackColorData[0]).toEqual(
			expect.objectContaining({ color: COLORS.primary }),
		);

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

		const negativeSummaryMetrics = getSummaryMetrics(
			{
				missingCurrencies: [],
				totalIncome: "100",
				totalExpense: "150",
				netProfit: "-50",
				categories: [],
				investments: [],
			},
			"-10",
			"10",
			"-60",
		);
		expect(negativeSummaryMetrics[3]?.accent).toBe("danger");
		expect(negativeSummaryMetrics[3]?.color).toBe(COLORS.danger);
		expect(negativeSummaryMetrics[4]?.accent).toBe("danger");
		expect(negativeSummaryMetrics[4]?.color).toBe(COLORS.danger);

		const positiveSummaryMetrics = getSummaryMetrics(
			{
				missingCurrencies: [],
				totalIncome: "100",
				totalExpense: "50",
				netProfit: "50",
				categories: [],
				investments: [],
			},
			"-10",
			"10",
			"30",
		);
		expect(positiveSummaryMetrics[4]?.accent).toBe("success");
		expect(positiveSummaryMetrics[4]?.color).toBe(COLORS.success);
	});

	it("covers getScreenData branch when min/max transaction dates are unavailable", async () => {
		const navigation = { navigate: vi.fn() };
		serviceMocks.getTransactionMinMaxDate.mockResolvedValueOnce(undefined);

		const setMinTxnDate = vi.fn();
		const setMaxTxnDate = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 8) return [undefined, setMinTxnDate];
			if (stateCall === 9) return [undefined, setMaxTxnDate];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		AnalysisScreen({ navigation } as any);
		await flush();

		expect(setMinTxnDate).not.toHaveBeenCalled();
		expect(setMaxTxnDate).not.toHaveBeenCalled();
	});

	it("covers disabled arrows, error notice, and donut center fallback", async () => {
		const navigation = { navigate: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["MONTH", vi.fn()];
			if (stateCall === 2)
				return [new Date("2026-01-01T00:00:00.000Z"), vi.fn()];
			if (stateCall === 5) {
				return [
					{
						missingCurrencies: [],
						totalIncome: "100",
						totalExpense: "50",
						netProfit: undefined,
						categories: [
							{
								categoryId: "c1",
								categoryName: "Food",
								currencyCode: "INR",
								credits: "10",
								debits: "20",
								net: "-10",
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
					},
					vi.fn(),
				];
			}
			if (stateCall === 6) return ["manual render error", vi.fn()];
			if (stateCall === 8) return [1, vi.fn()];
			if (stateCall === 9) return [1, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = AnalysisScreen({ navigation } as any);
		await flush();

		const arrowButtons = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				Object.prototype.hasOwnProperty.call(
					node?.props ?? {},
					"disabled",
				),
		);
		expect(arrowButtons).toHaveLength(2);
		expect(arrowButtons[0]?.props?.disabled).toBe(true);
		expect(arrowButtons[1]?.props?.disabled).toBe(true);

		expect(
			findByPredicate(
				tree,
				(node) =>
					node?.props?.message === "manual render error" &&
					node?.props?.tone === "danger",
			),
		).not.toHaveLength(0);

		const donut = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.centerLabel === "string" &&
				Array.isArray(node?.props?.data),
		)[0];
		expect(donut?.props?.centerLabel).toBe("INR 0");
	});
});
