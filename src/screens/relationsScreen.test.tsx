import { beforeEach, describe, expect, it, vi } from "vitest";

import COLORS from "@/constants/colors";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useLayoutEffect: vi.fn(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getAnalysisSummary: vi.fn(),
	getInvestmentNetAmount: vi.fn(),
	getInvestmentNetLabel: vi.fn(),
	getCategories: vi.fn(),
	setCategoryArchived: vi.fn(),
	getExchangeRates: vi.fn(),
	getInvestments: vi.fn(),
	setInvestmentArchived: vi.fn(),
	getNativeCurrencyDisplay: vi.fn(),
	updateNativeCurrencyDisplay: vi.fn(),
	getSources: vi.fn(),
	setSourceArchived: vi.fn(),
	validateSource: vi.fn(),
	getTrips: vi.fn(),
	setTripArchived: vi.fn(),
	getTripTotals: vi.fn(),
}));

const hookMocks = vi.hoisted(() => ({
	refreshData: vi.fn(),
	confirm: vi.fn(),
	showMessage: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useCallback: reactMocks.useCallback,
		useEffect: reactMocks.useEffect,
		useLayoutEffect: reactMocks.useLayoutEffect,
		useMemo: reactMocks.useMemo,
		useState: reactMocks.useState,
	};
});

vi.mock("@react-navigation/native", () => ({
	useFocusEffect: (callback: () => void) => callback(),
}));

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
vi.mock("@/components/EmptyState", () => ({
	default: (props: any) => ({ type: "EmptyState", props }),
}));
vi.mock("@/components/FloatingAddButton", () => ({
	default: (props: any) => ({ type: "FloatingAddButton", props }),
}));
vi.mock("@/components/GlassCard", () => ({
	default: (props: any) => ({ type: "GlassCard", props }),
}));
vi.mock("@/components/HeaderIconButton", () => ({
	default: (props: any) => ({ type: "HeaderIconButton", props }),
}));
vi.mock("@/components/ListHeader", () => ({
	default: (props: any) => ({ type: "ListHeader", props }),
}));
vi.mock("@/components/Notice", () => ({
	default: (props: any) => ({ type: "Notice", props }),
}));
vi.mock("@/components/ScreenList", () => ({
	default: (props: any) => ({ type: "ScreenList", props }),
}));
vi.mock("@/components/SearchBar", () => ({
	default: (props: any) => ({ type: "SearchBar", props }),
}));

vi.mock("@/hooks/useAppDialog", () => ({
	default: () => ({
		confirm: hookMocks.confirm,
		showMessage: hookMocks.showMessage,
	}),
}));
vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({
		database: { id: "db" },
		refreshData: hookMocks.refreshData,
	}),
}));

vi.mock("@/services/analysisService", () => ({
	default: {
		getAnalysisSummary: serviceMocks.getAnalysisSummary,
		getInvestmentNetAmount: serviceMocks.getInvestmentNetAmount,
		getInvestmentNetLabel: serviceMocks.getInvestmentNetLabel,
	},
}));
vi.mock("@/services/categoryService", () => ({
	default: {
		getCategories: serviceMocks.getCategories,
		setCategoryArchived: serviceMocks.setCategoryArchived,
	},
}));
vi.mock("@/services/exchangeRateService", () => ({
	default: { getExchangeRates: serviceMocks.getExchangeRates },
}));
vi.mock("@/services/investmentService", () => ({
	default: {
		getInvestments: serviceMocks.getInvestments,
		setInvestmentArchived: serviceMocks.setInvestmentArchived,
	},
}));
vi.mock("@/services/settingsService", () => ({
	default: {
		getNativeCurrencyDisplay: serviceMocks.getNativeCurrencyDisplay,
		updateNativeCurrencyDisplay: serviceMocks.updateNativeCurrencyDisplay,
	},
}));
vi.mock("@/services/sourceService", () => ({
	default: {
		getSources: serviceMocks.getSources,
		setSourceArchived: serviceMocks.setSourceArchived,
		validateSource: serviceMocks.validateSource,
	},
}));
vi.mock("@/services/tripService", () => ({
	default: {
		getTrips: serviceMocks.getTrips,
		setTripArchived: serviceMocks.setTripArchived,
	},
}));
vi.mock("@/services/tripTotalService", () => ({
	default: { getTripTotals: serviceMocks.getTripTotals },
}));

vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/money", () => ({
	default: {
		compareMoney: (a: string, b: string) => Number(a) - Number(b),
		formatMoney: (amount: string, currency: string) =>
			`${currency} ${amount}`,
		ZERO_AMOUNT: "0",
	},
}));
vi.mock("@/utils/relation", () => ({
	default: (kind: string) => ({
		plural: `${kind.toLowerCase()}s`,
		singular: kind.toLowerCase(),
		title: `${kind} title`,
	}),
}));

import RelationsScreen from "@/screens/RelationsScreen";

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

describe("RelationsScreen", () => {
	beforeEach(() => {
		vi.spyOn(globalThis, "setTimeout").mockImplementation(((fn: any) => {
			fn();
			return 0;
		}) as any);
		vi.spyOn(globalThis, "clearTimeout").mockImplementation(() => {});

		reactMocks.useEffect.mockReset();
		reactMocks.useLayoutEffect.mockReset();
		reactMocks.useState.mockReset();
		reactMocks.useEffect.mockImplementation((effect: () => void) => {
			effect();
		});
		reactMocks.useLayoutEffect.mockImplementation((effect: () => void) => {
			effect();
		});
		reactMocks.useState.mockImplementation((initial: any) => [
			typeof initial === "function" ? initial() : initial,
			vi.fn(),
		]);

		Object.values(serviceMocks).forEach((mockFn) => mockFn.mockReset());
		Object.values(hookMocks).forEach((mockFn) => mockFn.mockReset());

		serviceMocks.getNativeCurrencyDisplay.mockResolvedValue(false);
		serviceMocks.getExchangeRates.mockResolvedValue([
			{ currencyCode: "USD", rateToInr: "80" },
		]);
		serviceMocks.getSources.mockResolvedValue([
			{
				id: "s1",
				name: "Cash",
				currencyCode: "USD",
				balance: "10",
				validatedAt: 5,
				latestTransactionCreatedAt: 4,
			},
		]);
		serviceMocks.getCategories.mockResolvedValue([
			{ id: "c1", name: "Food", isIncome: false },
		]);
		serviceMocks.getTrips.mockResolvedValue([{ id: "t1", name: "Goa" }]);
		serviceMocks.getTripTotals.mockResolvedValue([
			{ tripId: "t1", total: "100", currencyCode: "USD" },
		]);
		serviceMocks.getInvestments.mockResolvedValue([
			{ id: "i1", name: "MF" },
		]);
		serviceMocks.getAnalysisSummary.mockResolvedValue({
			categories: [{ categoryId: "c1", net: "50", currencyCode: "INR" }],
			investments: [
				{
					investmentId: "i1",
					totalInvested: "100",
					totalRedeemed: "20",
					net: "80",
					currencyCode: "INR",
				},
			],
			missingCurrencies: ["EUR"],
		});
		serviceMocks.getInvestmentNetAmount.mockImplementation(
			(net: string) => net,
		);
		serviceMocks.getInvestmentNetLabel.mockReturnValue("Net");
		serviceMocks.updateNativeCurrencyDisplay.mockResolvedValue(undefined);
		serviceMocks.validateSource.mockResolvedValue(undefined);
		serviceMocks.setSourceArchived.mockResolvedValue(undefined);
		serviceMocks.setCategoryArchived.mockResolvedValue(undefined);
		serviceMocks.setTripArchived.mockResolvedValue(undefined);
		serviceMocks.setInvestmentArchived.mockResolvedValue(undefined);
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);
	});

	it("covers SOURCE branch with validate, archive, currency toggle and navigation", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1)
				return [
					[
						{
							id: "s1",
							name: "Cash",
							currencyCode: "USD",
							balance: "10",
							validatedAt: 5,
							latestTransactionCreatedAt: 4,
						},
					],
					vi.fn(),
				];
			if (stateCall === 7) return [false, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: { key: "k", name: "Relations", params: { kind: "SOURCE" } },
		} as any);
		await flush();

		expect(serviceMocks.getSources).toHaveBeenCalledWith({ id: "db" });

		const headerRight = navigation.setOptions.mock.calls[0][0].headerRight;
		const header = headerRight();
		findByPredicate(
			header,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				(node?.props?.accessibilityLabel === "Convert to INR" ||
					node?.props?.accessibilityLabel ===
						"Show native currencies"),
		)[0]?.props?.onPress();
		await flush();
		expect(serviceMocks.updateNativeCurrencyDisplay).toHaveBeenCalledWith(
			{ id: "db" },
			true,
		);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({
			item: {
				kind: "SOURCE",
				entity: {
					id: "s1",
					name: "Cash",
					currencyCode: "USD",
					balance: "10",
					validatedAt: 5,
					latestTransactionCreatedAt: 4,
				},
			},
		});
		const pressables = findByPredicate(
			row,
			(node) => typeof node?.props?.onPress === "function",
		);
		pressables[0]?.props?.onPress();
		pressables[1]?.props?.onPress();
		pressables[2]?.props?.onPress();
		await flush();

		expect(serviceMocks.validateSource).toHaveBeenCalledWith(
			{ id: "db" },
			"s1",
		);
		expect(serviceMocks.setSourceArchived).toHaveBeenCalledWith(
			{ id: "db" },
			"s1",
			true,
		);
		expect(hookMocks.refreshData).toHaveBeenCalled();
		expect(navigation.navigate).toHaveBeenCalledWith("LinkedTransactions", {
			kind: "SOURCE",
			entityId: "s1",
			entityName: "Cash",
		});
	});

	it("covers CATEGORY branch and archive action", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 2)
				return [[{ id: "c1", name: "Food", isIncome: false }], vi.fn()];
			if (stateCall === 6) {
				return [
					{
						categories: [
							{
								categoryId: "c1",
								net: "50",
								currencyCode: "INR",
							},
						],
						investments: [],
						missingCurrencies: ["EUR"],
					},
					vi.fn(),
				];
			}
			if (stateCall === 7) return [false, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: {
				key: "k2",
				name: "Relations",
				params: { kind: "CATEGORY" },
			},
		} as any);
		await flush();

		expect(serviceMocks.getCategories).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getAnalysisSummary).toHaveBeenCalled();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({
			item: {
				kind: "CATEGORY",
				entity: { id: "c1", name: "Food", isIncome: false },
			},
		});
		findByPredicate(
			row,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => node.props.onPress());
		await flush();

		expect(serviceMocks.setCategoryArchived).toHaveBeenCalledWith(
			{ id: "db" },
			"c1",
			true,
		);
		expect(navigation.navigate).toHaveBeenCalledWith("LinkedTransactions", {
			kind: "CATEGORY",
			entityId: "c1",
			entityName: "Food",
		});
	});

	it("covers TRIP branch rendering and archive action", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 3) return [[{ id: "t1", name: "Goa" }], vi.fn()];
			if (stateCall === 4)
				return [
					[{ tripId: "t1", total: "100", currencyCode: "USD" }],
					vi.fn(),
				];
			if (stateCall === 7) return [false, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: { key: "k3", name: "Relations", params: { kind: "TRIP" } },
		} as any);
		await flush();

		expect(serviceMocks.getTrips).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getTripTotals).toHaveBeenCalledWith({ id: "db" });

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({
			item: { kind: "TRIP", entity: { id: "t1", name: "Goa" } },
		});
		findByPredicate(
			row,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => node.props.onPress());
		await flush();

		expect(serviceMocks.setTripArchived).toHaveBeenCalledWith(
			{ id: "db" },
			"t1",
			true,
		);
		expect(navigation.navigate).toHaveBeenCalledWith("LinkedTransactions", {
			kind: "TRIP",
			entityId: "t1",
			entityName: "Goa",
		});
	});

	it("covers INVESTMENT branch rendering and archive action", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 5) return [[{ id: "i1", name: "MF" }], vi.fn()];
			if (stateCall === 6) {
				return [
					{
						categories: [],
						investments: [
							{
								investmentId: "i1",
								totalInvested: "100",
								totalRedeemed: "20",
								net: "80",
								currencyCode: "INR",
							},
						],
						missingCurrencies: [],
					},
					vi.fn(),
				];
			}
			if (stateCall === 7) return [false, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: {
				key: "k4",
				name: "Relations",
				params: { kind: "INVESTMENT" },
			},
		} as any);
		await flush();

		expect(serviceMocks.getInvestments).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getAnalysisSummary).toHaveBeenCalled();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({
			item: { kind: "INVESTMENT", entity: { id: "i1", name: "MF" } },
		});
		findByPredicate(
			row,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => node.props.onPress());
		await flush();

		expect(serviceMocks.setInvestmentArchived).toHaveBeenCalledWith(
			{ id: "db" },
			"i1",
			true,
		);
		expect(navigation.navigate).toHaveBeenCalledWith("LinkedTransactions", {
			kind: "INVESTMENT",
			entityId: "i1",
			entityName: "MF",
		});
	});

	it("shows search bar, missing-currency notice and add button branch", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 2)
				return [[{ id: "c1", name: "Food", isIncome: false }], vi.fn()];
			if (stateCall === 6) {
				return [
					{
						categories: [
							{
								categoryId: "c1",
								net: "50",
								currencyCode: "INR",
							},
						],
						investments: [],
						missingCurrencies: ["EUR"],
					},
					vi.fn(),
				];
			}
			if (stateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			if (stateCall === 10) return [true, vi.fn()];
			if (stateCall === 11) return ["fo", vi.fn()];
			if (stateCall === 12) return ["fo", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: {
				key: "k5",
				name: "Relations",
				params: { kind: "CATEGORY" },
			},
		} as any);
		await flush();

		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.placeholder === "Search categorys...",
			),
		).not.toHaveLength(0);
		expect(
			findByPredicate(
				tree,
				(node) =>
					typeof node?.props?.message === "string" &&
					node.props.message.includes("Missing INR rates: EUR"),
			),
		).not.toHaveLength(0);
	});

	it("shows load error notice when initial fetch fails", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		serviceMocks.getNativeCurrencyDisplay.mockRejectedValueOnce(
			new Error("load failed"),
		);
		const setError = vi.fn();

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 9) return ["", setError];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: { key: "k6", name: "Relations", params: { kind: "SOURCE" } },
		} as any);
		await flush();
		await flush();

		expect(setError).toHaveBeenCalledWith("load failed");
		expect(tree).toBeTruthy();
	});

	it("shows validation error dialog branch", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		serviceMocks.validateSource.mockRejectedValueOnce(
			new Error("validate failed"),
		);

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "s1",
							name: "Cash",
							currencyCode: "USD",
							balance: "10",
							validatedAt: null,
							latestTransactionCreatedAt: 4,
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 7) return [false, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: { key: "k7", name: "Relations", params: { kind: "SOURCE" } },
		} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({
			item: {
				kind: "SOURCE",
				entity: {
					id: "s1",
					name: "Cash",
					currencyCode: "USD",
					balance: "10",
					validatedAt: null,
					latestTransactionCreatedAt: 4,
				},
			},
		});
		findByPredicate(
			row,
			(node) =>
				node?.props?.accessibilityLabel === "Validate" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(hookMocks.showMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Unable to validate",
				message: "validate failed",
				variant: "danger",
			}),
		);
	});

	it("shows archive error dialog plus keyExtractor and floating add callbacks", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		serviceMocks.setSourceArchived.mockRejectedValueOnce(
			new Error("archive failed"),
		);

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "s1",
							name: "Cash",
							currencyCode: "USD",
							balance: "10",
							validatedAt: 5,
							latestTransactionCreatedAt: 4,
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 7) return [false, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: { key: "k8", name: "Relations", params: { kind: "SOURCE" } },
		} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		expect(screenList.props.keyExtractor({ entity: { id: "e1" } })).toBe(
			"e1",
		);

		const row = screenList.props.renderItem({
			item: {
				kind: "SOURCE",
				entity: {
					id: "s1",
					name: "Cash",
					currencyCode: "USD",
					balance: "10",
					validatedAt: 5,
					latestTransactionCreatedAt: 4,
				},
			},
		});
		findByPredicate(
			row,
			(node) =>
				node?.props?.accessibilityLabel === "Archive" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(hookMocks.showMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Unable to archive",
				message: "archive failed",
				variant: "danger",
			}),
		);

		findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				typeof node?.props?.onLongPress !== "function",
		).forEach((node) => {
			node.props.onPress();
		});
		expect(navigation.navigate).toHaveBeenCalledWith("RelationForm", {
			kind: "SOURCE",
		});
	});

	it("covers SOURCE converted INR amount branch and row-action pressed styles", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "s1",
							name: "Cash",
							currencyCode: "USD",
							balance: "10",
							validatedAt: null,
							latestTransactionCreatedAt: 4,
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 7) return [false, vi.fn()];
			if (stateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: { key: "k9", name: "Relations", params: { kind: "SOURCE" } },
		} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({
			item: {
				kind: "SOURCE",
				entity: {
					id: "s1",
					name: "Cash",
					currencyCode: "USD",
					balance: "10",
					validatedAt: null,
					latestTransactionCreatedAt: 4,
				},
			},
		});

		expect(String(JSON.stringify(row) ?? "")).toContain("≈");

		const validateIcon = findByPredicate(
			row,
			(node) =>
				node?.props?.accessibilityLabel === "Validate" &&
				typeof node?.props?.style === "function",
		)[0];
		const archiveIcon = findByPredicate(
			row,
			(node) =>
				node?.props?.accessibilityLabel === "Archive" &&
				typeof node?.props?.style === "function",
		)[0];

		validateIcon?.props?.style({ pressed: true });
		archiveIcon?.props?.style({ pressed: true });
	});

	it("covers INVESTMENT list sorting comparator with multiple entities", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 5) {
				return [
					[
						{ id: "i1", name: "High" },
						{ id: "i2", name: "Low" },
					],
					vi.fn(),
				];
			}
			if (stateCall === 6) {
				return [
					{
						categories: [],
						investments: [
							{
								investmentId: "i1",
								totalInvested: "100",
								totalRedeemed: "10",
								net: "10",
								currencyCode: "USD",
							},
							{
								investmentId: "i2",
								totalInvested: "100",
								totalRedeemed: "90",
								net: "20",
								currencyCode: "INR",
							},
						],
						missingCurrencies: [],
					},
					vi.fn(),
				];
			}
			if (stateCall === 7) return [false, vi.fn()];
			if (stateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: {
				key: "k10",
				name: "Relations",
				params: { kind: "INVESTMENT" },
			},
		} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(screenList.props.data).toHaveLength(2);
		expect(screenList.props.data[0].entity.id).toBe("i1");
		expect(screenList.props.data[1].entity.id).toBe("i2");
	});

	it("covers SOURCE, CATEGORY and TRIP sort comparator branches", async () => {
		const sourceNav = { navigate: vi.fn(), setOptions: vi.fn() };
		let sourceStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			sourceStateCall += 1;
			if (sourceStateCall === 1) {
				return [
					[
						{
							id: "s1",
							name: "USD",
							currencyCode: "USD",
							balance: "10",
							validatedAt: null,
							latestTransactionCreatedAt: 4,
						},
						{
							id: "s2",
							name: "INR",
							currencyCode: "INR",
							balance: "500",
							validatedAt: null,
							latestTransactionCreatedAt: 3,
						},
					],
					vi.fn(),
				];
			}
			if (sourceStateCall === 7) return [false, vi.fn()];
			if (sourceStateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});
		const sourceTree = RelationsScreen({
			navigation: sourceNav,
			route: {
				key: "k11",
				name: "Relations",
				params: { kind: "SOURCE" },
			},
		} as any);
		await flush();
		const sourceList = findByPredicate(
			sourceTree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(sourceList.props.data[0].entity.id).toBe("s2");
		expect(sourceList.props.data[1].entity.id).toBe("s1");

		const categoryNav = { navigate: vi.fn(), setOptions: vi.fn() };
		let categoryStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			categoryStateCall += 1;
			if (categoryStateCall === 2) {
				return [
					[
						{ id: "c1", name: "Low", isIncome: false },
						{ id: "c2", name: "High", isIncome: true },
					],
					vi.fn(),
				];
			}
			if (categoryStateCall === 6) {
				return [
					{
						categories: [
							{
								categoryId: "c1",
								net: "10",
								currencyCode: "INR",
							},
							{ categoryId: "c2", net: "5", currencyCode: "USD" },
						],
						investments: [],
						missingCurrencies: [],
					},
					vi.fn(),
				];
			}
			if (categoryStateCall === 7) return [false, vi.fn()];
			if (categoryStateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});
		const categoryTree = RelationsScreen({
			navigation: categoryNav,
			route: {
				key: "k12",
				name: "Relations",
				params: { kind: "CATEGORY" },
			},
		} as any);
		await flush();
		const categoryList = findByPredicate(
			categoryTree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(categoryList.props.data[0].entity.id).toBe("c1");
		expect(categoryList.props.data[1].entity.id).toBe("c2");

		const tripNav = { navigate: vi.fn(), setOptions: vi.fn() };
		let tripStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			tripStateCall += 1;
			if (tripStateCall === 3) {
				return [
					[
						{ id: "t1", name: "Less" },
						{ id: "t2", name: "More" },
					],
					vi.fn(),
				];
			}
			if (tripStateCall === 4) {
				return [
					[
						{ tripId: "t1", total: "10", currencyCode: "INR" },
						{ tripId: "t2", total: "5", currencyCode: "USD" },
					],
					vi.fn(),
				];
			}
			if (tripStateCall === 7) return [false, vi.fn()];
			if (tripStateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});
		const tripTree = RelationsScreen({
			navigation: tripNav,
			route: { key: "k13", name: "Relations", params: { kind: "TRIP" } },
		} as any);
		await flush();
		const tripList = findByPredicate(
			tripTree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(tripList.props.data[0].entity.id).toBe("t2");
		expect(tripList.props.data[1].entity.id).toBe("t1");
	});

	it("covers close-search header callback and row action component function body", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		const setSearchVisible = vi.fn();
		const setSearchQuery = vi.fn();
		const setSearchDebounced = vi.fn();

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "s1",
							name: "Cash",
							currencyCode: "USD",
							balance: "10",
							validatedAt: null,
							latestTransactionCreatedAt: 4,
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 7) return [false, vi.fn()];
			if (stateCall === 10) return [true, setSearchVisible];
			if (stateCall === 11) return ["cash", setSearchQuery];
			if (stateCall === 12) return ["cash", setSearchDebounced];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = RelationsScreen({
			navigation,
			route: {
				key: "k14",
				name: "Relations",
				params: { kind: "SOURCE" },
			},
		} as any);
		await flush();

		const headerRight = navigation.setOptions.mock.calls[0][0].headerRight;
		const header = headerRight();
		findByPredicate(
			header,
			(node) =>
				node?.props?.accessibilityLabel === "Close search" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();

		expect(setSearchVisible).toHaveBeenCalled();
		expect(setSearchQuery).toHaveBeenCalledWith("");
		expect(setSearchDebounced).toHaveBeenCalledWith("");

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({
			item: {
				kind: "SOURCE",
				entity: {
					id: "s1",
					name: "Cash",
					currencyCode: "USD",
					balance: "10",
					validatedAt: null,
					latestTransactionCreatedAt: 4,
				},
			},
		});
		const rowAction = findByPredicate(
			row,
			(node) =>
				typeof node?.type === "function" &&
				node?.props?.accessibilityLabel === "Validate",
		)[0];
		const resolved = rowAction.type(rowAction.props);
		resolved?.props?.style?.({ pressed: true });
		expect(resolved?.props?.accessibilityLabel).toBe("Validate");
	});

	it("covers CATEGORY/TRIP/INVESTMENT remaining render branches", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };

		let tripStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			tripStateCall += 1;
			if (tripStateCall === 3) {
				return [[{ id: "t1", name: "Trip" }], vi.fn()];
			}
			if (tripStateCall === 4) {
				return [
					[{ tripId: "t1", total: "-5", currencyCode: "USD" }],
					vi.fn(),
				];
			}
			if (tripStateCall === 7) return [false, vi.fn()];
			if (tripStateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tripTree = RelationsScreen({
			navigation,
			route: { key: "k15", name: "Relations", params: { kind: "TRIP" } },
		} as any);
		await flush();

		const tripList = findByPredicate(
			tripTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const tripRow = tripList.props.renderItem({
			item: { kind: "TRIP", entity: { id: "t1", name: "Trip" } },
		});
		expect(String(JSON.stringify(tripRow) ?? "")).toContain("USD -5");
		expect(String(JSON.stringify(tripRow) ?? "")).toContain("INR 400");

		let categoryStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			categoryStateCall += 1;
			if (categoryStateCall === 2) {
				return [
					[{ id: "c2", name: "Salary", isIncome: true }],
					vi.fn(),
				];
			}
			if (categoryStateCall === 6) {
				return [
					{ categories: [], investments: [], missingCurrencies: [] },
					vi.fn(),
				];
			}
			if (categoryStateCall === 7) return [false, vi.fn()];
			if (categoryStateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const categoryTree = RelationsScreen({
			navigation,
			route: {
				key: "k16",
				name: "Relations",
				params: { kind: "CATEGORY" },
			},
		} as any);
		await flush();

		const categoryList = findByPredicate(
			categoryTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const categoryRow = categoryList.props.renderItem({
			item: {
				kind: "CATEGORY",
				entity: { id: "c2", name: "Salary", isIncome: true },
			},
		});
		expect(String(JSON.stringify(categoryRow) ?? "")).toContain(
			"Income category",
		);
		expect(String(JSON.stringify(categoryRow) ?? "")).toContain("INR 0");

		let investmentStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			investmentStateCall += 1;
			if (investmentStateCall === 5) {
				return [[{ id: "i1", name: "Fund" }], vi.fn()];
			}
			if (investmentStateCall === 6) {
				return [
					{
						categories: [],
						investments: [
							{
								investmentId: "i1",
								totalInvested: "40",
								totalRedeemed: "50",
								net: "-10",
								currencyCode: "USD",
							},
							{
								investmentId: "i1",
								totalInvested: "50",
								totalRedeemed: "50",
								net: "0",
								currencyCode: "INR",
							},
						],
						missingCurrencies: [],
					},
					vi.fn(),
				];
			}
			if (investmentStateCall === 7) return [true, vi.fn()];
			if (investmentStateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const investmentTree = RelationsScreen({
			navigation,
			route: {
				key: "k17",
				name: "Relations",
				params: { kind: "INVESTMENT" },
			},
		} as any);
		await flush();

		const investmentList = findByPredicate(
			investmentTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const investmentRow = investmentList.props.renderItem({
			item: { kind: "INVESTMENT", entity: { id: "i1", name: "Fund" } },
		});
		expect(String(JSON.stringify(investmentRow) ?? "")).toContain(
			"USD -10",
		);
		expect(String(JSON.stringify(investmentRow) ?? "")).toContain("INR 0");
	});

	it("covers header error notice, category native display, and trip empty totals", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };

		let categoryStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			categoryStateCall += 1;
			if (categoryStateCall === 2) {
				return [[{ id: "c1", name: "Food", isIncome: false }], vi.fn()];
			}
			if (categoryStateCall === 6) {
				return [
					{
						categories: [
							{
								categoryId: "c1",
								net: "10",
								currencyCode: "INR",
							},
						],
						investments: [],
						missingCurrencies: [],
					},
					vi.fn(),
				];
			}
			if (categoryStateCall === 7) return [true, vi.fn()];
			if (categoryStateCall === 9)
				return ["manual header error", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const categoryTree = RelationsScreen({
			navigation,
			route: {
				key: "k18",
				name: "Relations",
				params: { kind: "CATEGORY" },
			},
		} as any);
		await flush();

		expect(
			findByPredicate(
				categoryTree,
				(node) =>
					node?.props?.message === "manual header error" &&
					node?.props?.tone === "danger",
			),
		).not.toHaveLength(0);

		const categoryList = findByPredicate(
			categoryTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const categoryRow = categoryList.props.renderItem({
			item: {
				kind: "CATEGORY",
				entity: { id: "c1", name: "Food", isIncome: false },
			},
		});
		expect(String(JSON.stringify(categoryRow) ?? "")).not.toContain("≈ ");

		let tripStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			tripStateCall += 1;
			if (tripStateCall === 3) {
				return [[{ id: "t-empty", name: "Empty trip" }], vi.fn()];
			}
			if (tripStateCall === 4) return [[], vi.fn()];
			if (tripStateCall === 7) return [false, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tripTree = RelationsScreen({
			navigation,
			route: {
				key: "k19",
				name: "Relations",
				params: { kind: "TRIP" },
			},
		} as any);
		await flush();

		const tripList = findByPredicate(
			tripTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const tripRow = tripList.props.renderItem({
			item: {
				kind: "TRIP",
				entity: { id: "t-empty", name: "Empty trip" },
			},
		});
		expect(String(JSON.stringify(tripRow) ?? "")).toContain("INR 0");
	});

	it("covers source negative converted color and category/investment empty fallback branches", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };

		let sourceStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			sourceStateCall += 1;
			if (sourceStateCall === 1) {
				return [
					[
						{
							id: "s-neg",
							name: "Debt",
							currencyCode: "USD",
							balance: "-10",
							validatedAt: 1,
							latestTransactionCreatedAt: 1,
						},
					],
					vi.fn(),
				];
			}
			if (sourceStateCall === 7) return [false, vi.fn()];
			if (sourceStateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const sourceTree = RelationsScreen({
			navigation,
			route: {
				key: "k20",
				name: "Relations",
				params: { kind: "SOURCE" },
			},
		} as any);
		await flush();

		const sourceList = findByPredicate(
			sourceTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const sourceRow = sourceList.props.renderItem({
			item: {
				kind: "SOURCE",
				entity: {
					id: "s-neg",
					name: "Debt",
					currencyCode: "USD",
					balance: "-10",
					validatedAt: 1,
					latestTransactionCreatedAt: 1,
				},
			},
		});
		expect(String(JSON.stringify(sourceRow) ?? "")).toContain("INR 800");

		let categoryStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			categoryStateCall += 1;
			if (categoryStateCall === 2)
				return [
					[{ id: "c-neg", name: "Loss", isIncome: false }],
					vi.fn(),
				];
			if (categoryStateCall === 6) return [null, vi.fn()];
			if (categoryStateCall === 7) return [true, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const categoryTree = RelationsScreen({
			navigation,
			route: {
				key: "k21",
				name: "Relations",
				params: { kind: "CATEGORY" },
			},
		} as any);
		await flush();

		const categoryList = findByPredicate(
			categoryTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const categoryRow = categoryList.props.renderItem({
			item: {
				kind: "CATEGORY",
				entity: { id: "c-neg", name: "Loss", isIncome: false },
			},
		});
		expect(String(JSON.stringify(categoryRow) ?? "")).toContain("INR 0");

		let tripStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			tripStateCall += 1;
			if (tripStateCall === 3)
				return [[{ id: "t1", name: "Trip" }], vi.fn()];
			if (tripStateCall === 4)
				return [
					[{ tripId: "t1", total: "5", currencyCode: "INR" }],
					vi.fn(),
				];
			if (tripStateCall === 6) return [null, vi.fn()];
			if (tripStateCall === 7) return [true, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tripTree = RelationsScreen({
			navigation,
			route: {
				key: "k22",
				name: "Relations",
				params: { kind: "TRIP" },
			},
		} as any);
		await flush();

		const tripList = findByPredicate(
			tripTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const tripRow = tripList.props.renderItem({
			item: { kind: "TRIP", entity: { id: "t1", name: "Trip" } },
		});
		expect(String(JSON.stringify(tripRow) ?? "")).not.toContain(
			"Invested ",
		);
	});

	it("covers remaining relations header and null-analysis branches", async () => {
		const clearSpy = vi.spyOn(globalThis, "clearTimeout");
		reactMocks.useEffect.mockImplementation((effect: () => void) => {
			const cleanup = effect();
			if (typeof cleanup === "function") cleanup();
		});

		const setSearchVisible = vi.fn();
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };

		let sourceStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			sourceStateCall += 1;
			if (sourceStateCall === 1) {
				return [
					[
						{
							id: "s-inr",
							name: "INR Wallet",
							currencyCode: "INR",
							balance: "15",
							validatedAt: null,
							latestTransactionCreatedAt: null,
						},
					],
					vi.fn(),
				];
			}
			if (sourceStateCall === 7) return [true, vi.fn()];
			if (sourceStateCall === 10) return [false, setSearchVisible];
			if (sourceStateCall === 11) return ["cash", vi.fn()];
			if (sourceStateCall === 12) return ["cash", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const sourceTree = RelationsScreen({
			navigation,
			route: {
				key: "k23",
				name: "Relations",
				params: { kind: "SOURCE" },
			},
		} as any);
		await flush();

		expect(clearSpy).toHaveBeenCalled();

		const headerRight =
			navigation.setOptions.mock.calls[0]?.[0]?.headerRight;
		const header = headerRight?.();
		const searchBtn = findByPredicate(
			header,
			(node) =>
				node?.props?.accessibilityLabel === "Search" &&
				typeof node?.props?.onPress === "function",
		)[0];
		searchBtn?.props?.onPress?.();

		const toggleUpdater = setSearchVisible.mock.calls[0]?.[0] as (
			v: boolean,
		) => boolean;
		expect(toggleUpdater(true)).toBe(false);
		expect(
			findByPredicate(
				header,
				(node) => node?.props?.accessibilityLabel === "Convert to INR",
			),
		).not.toHaveLength(0);

		const sourceList = findByPredicate(
			sourceTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const sourceRow = sourceList.props.renderItem({
			item: {
				kind: "SOURCE",
				entity: {
					id: "s-inr",
					name: "INR Wallet",
					currencyCode: "INR",
					balance: "15",
					validatedAt: null,
					latestTransactionCreatedAt: null,
				},
			},
		});
		expect(String(JSON.stringify(sourceRow) ?? "")).not.toContain("≈ ");

		const archiveRowAction = findByPredicate(
			sourceRow,
			(node) =>
				typeof node?.type === "function" &&
				node?.props?.accessibilityLabel === "Archive",
		)[0];
		const archiveResolved = archiveRowAction?.type?.(
			archiveRowAction.props,
		);
		expect(typeof archiveResolved?.props?.children?.props?.color).toBe(
			"string",
		);

		let categoryStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			categoryStateCall += 1;
			if (categoryStateCall === 2) {
				return [
					[
						{ id: "c-a", name: "A", isIncome: false },
						{ id: "c-b", name: "B", isIncome: false },
					],
					vi.fn(),
				];
			}
			if (categoryStateCall === 6) return [null, vi.fn()];
			if (categoryStateCall === 7) return [true, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const categoryTree = RelationsScreen({
			navigation,
			route: {
				key: "k24",
				name: "Relations",
				params: { kind: "CATEGORY" },
			},
		} as any);
		await flush();

		const categoryList = findByPredicate(
			categoryTree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(categoryList.props.data).toHaveLength(2);
		const categoryRow = categoryList.props.renderItem({
			item: {
				kind: "CATEGORY",
				entity: { id: "c-a", name: "A", isIncome: false },
			},
		});
		expect(String(JSON.stringify(categoryRow) ?? "")).toContain("INR 0");

		let investmentStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			investmentStateCall += 1;
			if (investmentStateCall === 5) {
				return [
					[
						{ id: "i-a", name: "A" },
						{ id: "i-b", name: "B" },
					],
					vi.fn(),
				];
			}
			if (investmentStateCall === 6) return [null, vi.fn()];
			if (investmentStateCall === 7) return [true, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const investmentTree = RelationsScreen({
			navigation,
			route: {
				key: "k25",
				name: "Relations",
				params: { kind: "INVESTMENT" },
			},
		} as any);
		await flush();

		const investmentList = findByPredicate(
			investmentTree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(investmentList.props.data).toHaveLength(2);
		const investmentRow = investmentList.props.renderItem({
			item: { kind: "INVESTMENT", entity: { id: "i-a", name: "A" } },
		});
		expect(String(JSON.stringify(investmentRow) ?? "")).not.toContain(
			"Invested ",
		);
	});

	it("covers source missing-rate sort fallback and negative totals color branch", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		let sourceStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			sourceStateCall += 1;
			if (sourceStateCall === 1) {
				return [
					[
						{
							id: "s-eur",
							name: "Euro",
							currencyCode: "EUR",
							balance: "5",
							validatedAt: null,
							latestTransactionCreatedAt: null,
						},
						{
							id: "s-inr",
							name: "Inr",
							currencyCode: "INR",
							balance: "10",
							validatedAt: null,
							latestTransactionCreatedAt: null,
						},
					],
					vi.fn(),
				];
			}
			if (sourceStateCall === 6) return [null, vi.fn()];
			if (sourceStateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const sourceTree = RelationsScreen({
			navigation,
			route: {
				key: "k26",
				name: "Relations",
				params: { kind: "SOURCE" },
			},
		} as any);
		await flush();

		const sourceList = findByPredicate(
			sourceTree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(sourceList.props.data[0].entity.id).toBe("s-eur");

		let categoryStateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			categoryStateCall += 1;
			if (categoryStateCall === 2)
				return [[{ id: "c1", name: "Food", isIncome: false }], vi.fn()];
			if (categoryStateCall === 6) {
				return [
					{
						categories: [
							{
								categoryId: "c1",
								net: "-5",
								currencyCode: "INR",
							},
						],
						investments: [],
						missingCurrencies: [],
					},
					vi.fn(),
				];
			}
			if (categoryStateCall === 7) return [false, vi.fn()];
			if (categoryStateCall === 8)
				return [[{ currencyCode: "USD", rateToInr: "80" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const categoryTree = RelationsScreen({
			navigation,
			route: {
				key: "k27",
				name: "Relations",
				params: { kind: "CATEGORY" },
			},
		} as any);
		await flush();

		const categoryList = findByPredicate(
			categoryTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const categoryRow = categoryList.props.renderItem({
			item: {
				kind: "CATEGORY",
				entity: { id: "c1", name: "Food", isIncome: false },
			},
		});
		expect(
			findByPredicate(
				categoryRow,
				(node) => node?.props?.style?.[1]?.color === COLORS.danger,
			),
		).not.toHaveLength(0);
	});
});
