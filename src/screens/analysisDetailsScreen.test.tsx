import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getAnalysisSummary: vi.fn(),
	getInvestmentNetAmount: vi.fn(),
	getInvestmentNetLabel: vi.fn(),
	compareMoney: vi.fn(),
	formatMoney: vi.fn(),
	subtractMoney: vi.fn(),
	ZERO_AMOUNT: "0",
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

vi.mock("react-native", () => ({
	Pressable: (props: any) => ({ type: "Pressable", props }),
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));
vi.mock("@/components/EmptyState", () => ({
	default: (props: any) => ({ type: "EmptyState", props }),
}));
vi.mock("@/components/GlassCard", () => ({
	default: (props: any) => ({ type: "GlassCard", props }),
}));
vi.mock("@/components/ScreenList", () => ({
	default: (props: any) => ({ type: "ScreenList", props }),
}));
vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({ database: { id: "db" }, dataVersion: 1 }),
}));
vi.mock("@/services/analysisService", () => ({
	default: {
		getAnalysisSummary: serviceMocks.getAnalysisSummary,
		getInvestmentNetAmount: serviceMocks.getInvestmentNetAmount,
		getInvestmentNetLabel: serviceMocks.getInvestmentNetLabel,
	},
}));
vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/money", () => ({
	default: {
		compareMoney: serviceMocks.compareMoney,
		formatMoney: serviceMocks.formatMoney,
		subtractMoney: serviceMocks.subtractMoney,
		ZERO_AMOUNT: serviceMocks.ZERO_AMOUNT,
	},
}));
vi.mock("@/utils/runAfterRender", () => ({
	default: (fn: () => void) => fn(),
}));

import AnalysisDetailsScreen, {
	getCategoryAccent,
	getCategoryBreakdownText,
	getCategoryNetColor,
	getInvestmentAccent,
	getInvestmentColor,
	getInvestmentNetText,
	resolveDetailsView,
} from "@/screens/AnalysisDetailsScreen";

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

describe("AnalysisDetailsScreen", () => {
	beforeEach(() => {
		reactMocks.useEffect.mockReset();
		reactMocks.useState.mockReset();
		reactMocks.useEffect.mockImplementation((effect: () => void) => {
			effect();
		});
		[
			serviceMocks.getAnalysisSummary,
			serviceMocks.getInvestmentNetAmount,
			serviceMocks.getInvestmentNetLabel,
			serviceMocks.compareMoney,
			serviceMocks.formatMoney,
			serviceMocks.subtractMoney,
		].forEach((mockFn) => mockFn.mockReset());
		serviceMocks.compareMoney.mockImplementation(
			(a: string, b: string) => Number(a) - Number(b),
		);
		serviceMocks.formatMoney.mockImplementation(
			(amount: string, currency: string) => `${currency} ${amount}`,
		);
		serviceMocks.subtractMoney.mockImplementation((a: string, b: string) =>
			String(Number(a) - Number(b)),
		);
		serviceMocks.getInvestmentNetAmount.mockImplementation(
			(value: string) => value.replace("-", ""),
		);
		serviceMocks.getInvestmentNetLabel.mockReturnValue("Net");
	});

	it("formats category and investment values with the correct accents and text", () => {
		expect(getCategoryAccent("10")).toBe("success");
		expect(getCategoryAccent("-10")).toBe("danger");
		expect(getCategoryNetColor("10")).toBe("#52D6A3");
		expect(getCategoryNetColor("-10")).toBe("#FF6B86");
		expect(getInvestmentAccent("40")).toBe("danger");
		expect(getInvestmentAccent("-40")).toBe("success");
		expect(getInvestmentColor("40")).toBe("#FF6B86");
		expect(getInvestmentColor("-40")).toBe("#52D6A3");
		expect(getInvestmentColor("0")).toBe("#F4F1FF");
		expect(
			getCategoryBreakdownText({
				categoryId: "1",
				categoryName: "Food",
				currencyCode: "INR",
				credits: "10",
				debits: "20",
				isIncome: false,
				net: "-10",
			}),
		).toBe("Credits INR 10 · Debits INR 20");
		expect(getInvestmentNetText("40", "INR")).toBe("Net: INR 40");
	});

	it("renders the category list and the empty/error states", () => {
		const summary = {
			missingCurrencies: [],
			totalIncome: "100",
			totalExpense: "50",
			netProfit: "50",
			categories: [
				{
					categoryId: "cat-1",
					categoryName: "Food",
					currencyCode: "INR",
					credits: "10",
					debits: "20",
					isIncome: false,
					net: "-10",
				},
			],
			investments: [],
		};
		expect(getInvestmentAccent("0")).toBe("default");
		expect(getInvestmentColor("0")).toBe("#F4F1FF");
		reactMocks.useState.mockImplementation((initial: any) => {
			if (initial === null) return [summary, vi.fn()];
			return [initial, vi.fn()];
		});
		const categoryTree = AnalysisDetailsScreen({
			navigation: { navigate: vi.fn() },
			route: {
				params: {
					mode: "CATEGORIES",
					dateRangeStart: 1,
					dateRangeEnd: 2,
				},
			},
		} as any);
		const categoryListNode = findByPredicate(
			categoryTree,
			(node) => node?.props?.renderItem && node?.props?.data,
		)[0];
		expect(
			categoryListNode.props.keyExtractor({
				categoryId: "cat-1",
				currencyCode: "INR",
			}),
		).toBe("cat-1:INR");
		expect(
			typeof categoryListNode.props.renderItem({
				item: summary.categories[0],
			}),
		).toBe("object");

		const investmentSummary = {
			missingCurrencies: [],
			totalIncome: "0",
			totalExpense: "0",
			netProfit: "0",
			categories: [],
			investments: [
				{
					investmentId: "inv-1",
					investmentName: "Mutual fund",
					currencyCode: "INR",
					totalInvested: "100",
					totalRedeemed: "60",
					net: "40",
				},
			],
		};
		reactMocks.useState.mockImplementation((initial: any) => {
			if (initial === null) return [investmentSummary, vi.fn()];
			return [initial, vi.fn()];
		});
		const investmentTree = AnalysisDetailsScreen({
			navigation: { navigate: vi.fn() },
			route: {
				params: {
					mode: "INVESTMENTS",
					dateRangeStart: 1,
					dateRangeEnd: 2,
				},
			},
		} as any);
		expect(
			findByPredicate(
				investmentTree,
				(node) => node?.props?.data && node?.props?.renderItem,
			),
		).toHaveLength(1);
		const screenListNode = findByPredicate(
			investmentTree,
			(node) => node?.props?.keyExtractor,
		)[0];
		expect(
			screenListNode.props.keyExtractor({
				investmentId: "inv-1",
				currencyCode: "INR",
			}),
		).toBe("inv-1:INR");
		expect(
			typeof screenListNode.props.renderItem({
				item: investmentSummary.investments[0],
			}),
		).toBe("object");
		expect(resolveDetailsView("CATEGORIES", null, "")).toMatchObject({
			type: "empty",
			emptyMessage: "No categories in this period.",
		});
		expect(resolveDetailsView("INVESTMENTS", null, "")).toMatchObject({
			type: "empty",
			emptyMessage: "No investment activity in this period.",
		});
		expect(
			resolveDetailsView("CATEGORIES", null, "detail failed"),
		).toMatchObject({
			type: "error",
			errorMessage: "detail failed",
		});

		reactMocks.useState.mockImplementation((initial: any) => {
			if (initial === null) return [null, vi.fn()];
			if (typeof initial === "string") return ["detail failed", vi.fn()];
			return [initial, vi.fn()];
		});
		const errorTree = AnalysisDetailsScreen({
			navigation: { navigate: vi.fn() },
			route: {
				params: {
					mode: "CATEGORIES",
					dateRangeStart: 1,
					dateRangeEnd: 2,
				},
			},
		} as any);
		expect(
			findByPredicate(
				errorTree,
				(node) => node?.props?.children === "detail failed",
			),
		).toHaveLength(1);

		reactMocks.useState.mockImplementation((initial: any) => {
			if (initial === null) return [null, vi.fn()];
			if (typeof initial === "string") return ["", vi.fn()];
			return [initial, vi.fn()];
		});
		const emptyInvestmentTree = AnalysisDetailsScreen({
			navigation: { navigate: vi.fn() },
			route: {
				params: {
					mode: "INVESTMENTS",
					dateRangeStart: 1,
					dateRangeEnd: 2,
				},
			},
		} as any);
		expect(
			findByPredicate(
				emptyInvestmentTree,
				(node) => node?.props?.title === "No investment activity",
			),
		).toHaveLength(1);
		const emptyCategoryTree = AnalysisDetailsScreen({
			navigation: { navigate: vi.fn() },
			route: {
				params: {
					mode: "CATEGORIES",
					dateRangeStart: 1,
					dateRangeEnd: 2,
				},
			},
		} as any);
		expect(
			findByPredicate(
				emptyCategoryTree,
				(node) => node?.props?.title === "Nothing to analyse",
			),
		).toHaveLength(1);
	});
});
