import FloatingAddButton from "@/components/FloatingAddButton";
import { isValidElement, type ComponentProps, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useLayoutEffect: vi.fn(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getTransactions: vi.fn(),
	getTransactionDisplayReason: vi.fn(),
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

vi.mock("react-native", () => ({
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
	Pressable: (props: any) => ({ type: "Pressable", props }),
}));
vi.mock("@expo/vector-icons", () => ({
	Ionicons: (props: any) => ({ type: "Ionicons", props }),
}));

vi.mock("@/components/EmptyState", () => ({
	default: (props: any) => ({ type: "EmptyState", props }),
}));
vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));
vi.mock("@/components/FloatingAddButton", () => ({
	default: (props: any) => ({ type: "FloatingAddButton", props }),
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
vi.mock("@/components/SegmentedControl", () => ({
	default: (props: any) => ({ type: "SegmentedControl", props }),
}));
vi.mock("@/components/TransactionCard", () => ({
	default: (props: any) => ({ type: "TransactionCard", props }),
}));

vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({ database: { id: "db" }, dataVersion: 1 }),
}));

vi.mock("@/services/transactionService", () => ({
	default: {
		getTransactions: serviceMocks.getTransactions,
		getTransactionDisplayReason: serviceMocks.getTransactionDisplayReason,
	},
}));

vi.mock("@/utils/date", () => ({
	default: {
		formatDate: (value: number) => `date:${value}`,
		getDayDateRange: (date: Date) => ({
			start: date.getTime(),
			end: date.getTime() + 86_399_999,
		}),
		shiftDay: (date: Date, direction: -1 | 1) =>
			new Date(date.getTime() + direction * 86_400_000),
	},
}));
vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/money", () => ({
	default: {
		formatMoney: (amount: string, currency: string) =>
			`${currency} ${amount}`,
	},
}));
vi.mock("@/utils/runAfterRender", () => ({
	default: (fn: () => void) => fn(),
}));

import TransactionsScreen from "@/screens/TransactionsScreen";

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

describe("TransactionsScreen", () => {
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

		serviceMocks.getTransactions.mockReset();
		serviceMocks.getTransactionDisplayReason.mockReset();
		serviceMocks.getTransactions.mockResolvedValue([
			{
				id: "t1",
				classification: "GENERAL",
				amount: "100",
				sourceName: "Cash",
				sourceCurrencyCode: "INR",
				transactionAt: 10,
				reason: "Lunch",
			},
			{
				id: "t2",
				classification: "INVESTMENT",
				amount: "200",
				sourceName: "Broker",
				sourceCurrencyCode: "INR",
				transactionAt: 20,
				reason: "SIP",
			},
		]);
		serviceMocks.getTransactionDisplayReason.mockImplementation(
			(transaction: any) => transaction.reason,
		);
	});

	it("loads transactions and executes navigation actions", async () => {
		const setOptions = vi.fn();
		const navigation = { navigate: vi.fn(), setOptions };

		const tree = TransactionsScreen({ navigation } as any);
		await flush();

		expect(serviceMocks.getTransactions).toHaveBeenCalledWith(
			{ id: "db" },
			expect.objectContaining({
				end: expect.any(Number),
				start: expect.any(Number),
			}),
		);
		expect(setOptions).toHaveBeenCalled();

		const headerRight = setOptions.mock.calls[0][0].headerRight;
		const headerButton = headerRight();
		headerButton.props.onPress();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({
			item: {
				id: "t1",
				classification: "GENERAL",
				amount: "100",
				sourceName: "Cash",
				sourceCurrencyCode: "INR",
				transactionAt: 10,
				reason: "Lunch",
			},
		});
		const card = findByPredicate(
			row,
			(node) => typeof node?.props?.onPress === "function",
		)[0];
		card.props.onPress();
		card.props.onLongPress();

		const plainPressables = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				typeof node?.props?.onLongPress !== "function",
		);
		plainPressables.at(-1)?.props?.onPress();

		expect(navigation.navigate).toHaveBeenCalledWith("TransactionForm", {
			transactionId: "t1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("TransactionForm", {
			cloneFromTransactionId: "t1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("TransactionForm", {
			initialTransactionAt: expect.any(Number),
		});
	});

	it.each([
		{ day: "August 24", selectedDate: new Date(2026, 7, 24, 14, 30) },
		{ day: "today", selectedDate: new Date() },
	])(
		"passes $day from the list to a new transaction",
		async ({ selectedDate }) => {
			const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
			let stateCall = 0;
			reactMocks.useState.mockImplementation((initial: unknown) => {
				stateCall += 1;
				if (stateCall === 7) return [selectedDate, vi.fn()];
				return [
					typeof initial === "function"
						? (initial as () => unknown)()
						: initial,
					vi.fn(),
				];
			});
			const renderScreen = TransactionsScreen as (
				props: unknown,
			) => ReactElement;
			const tree = renderScreen({ navigation });
			await flush();
			const [addButton] = findByPredicate(
				tree,
				(node: unknown) =>
					isValidElement(node) && node.type === FloatingAddButton,
			) as ReactElement<ComponentProps<typeof FloatingAddButton>>[];

			addButton?.props.onPress();

			expect(navigation.navigate).toHaveBeenCalledWith(
				"TransactionForm",
				{
					initialTransactionAt: selectedDate.getTime(),
				},
			);
		},
	);

	it("covers debounced search timer callback execution", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		const setSearchDebounced = vi.fn();
		const clearSpy = vi.spyOn(globalThis, "clearTimeout");

		reactMocks.useEffect.mockImplementation((effect: () => void) => {
			const cleanup = effect();
			if (typeof cleanup === "function") cleanup();
		});

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 6) return ["cash", setSearchDebounced];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		TransactionsScreen({ navigation } as any);
		await flush();

		expect(setSearchDebounced).toHaveBeenCalledWith("");
		expect(clearSpy).toHaveBeenCalled();
	});

	it("covers header search toggle updater callback", async () => {
		const setOptions = vi.fn();
		const setSearchVisible = vi.fn();
		const navigation = { navigate: vi.fn(), setOptions };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 4) return [false, setSearchVisible];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		TransactionsScreen({ navigation } as any);
		await flush();

		const headerRight = setOptions.mock.calls[0]?.[0]?.headerRight;
		const headerButton = headerRight?.();
		headerButton?.props?.onPress?.();

		const updater = setSearchVisible.mock.calls[0]?.[0] as (
			current: boolean,
		) => boolean;
		expect(updater(true)).toBe(false);
	});

	it("applies classification and search filters", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "t1",
							classification: "GENERAL",
							amount: "100",
							sourceName: "Cash",
							sourceCurrencyCode: "INR",
							transactionAt: 10,
							reason: "Lunch",
						},
						{
							id: "t2",
							classification: "INVESTMENT",
							amount: "200",
							sourceName: "Broker",
							sourceCurrencyCode: "INR",
							transactionAt: 20,
							reason: "SIP",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["GENERAL", vi.fn()];
			if (stateCall === 4) return [true, vi.fn()];
			if (stateCall === 6) return ["lun", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionsScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(screenList.props.data).toHaveLength(1);
		expect(screenList.props.data[0].id).toBe("t1");
	});

	it("covers search cleanup, load error branch, and list key extractor", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		const clearSpy = vi.spyOn(globalThis, "clearTimeout");
		serviceMocks.getTransactions.mockRejectedValueOnce(
			new Error("load failed"),
		);

		reactMocks.useEffect.mockImplementation((effect: () => void) => {
			const cleanup = effect();
			if (typeof cleanup === "function") {
				cleanup();
			}
		});

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "t1",
							classification: "GENERAL",
							amount: "100",
							sourceName: "Cash",
							sourceCurrencyCode: "INR",
							transactionAt: 10,
							reason: "Lunch",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["ALL", vi.fn()];
			if (stateCall === 3) return ["load failed", vi.fn()];
			if (stateCall === 4) return [true, vi.fn()];
			if (stateCall === 5) return ["cash", vi.fn()];
			if (stateCall === 6) return ["cash", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionsScreen({ navigation } as any);
		await flush();

		expect(serviceMocks.getTransactions).toHaveBeenCalledWith(
			{ id: "db" },
			expect.objectContaining({
				end: expect.any(Number),
				start: expect.any(Number),
			}),
		);
		expect(clearSpy).toHaveBeenCalled();
		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.placeholder === "Search transactions...",
			),
		).not.toHaveLength(0);
		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.message === "load failed",
			),
		).not.toHaveLength(0);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		expect(screenList.props.keyExtractor({ id: "t1" })).toBe("t1");
	});

	it("covers search match branches beyond reason text", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "t2",
							classification: "GENERAL",
							amount: "200",
							sourceName: "Wallet",
							sourceCurrencyCode: "INR",
							transactionAt: 20,
							reason: "No match",
							categoryName: "Groceries",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["ALL", vi.fn()];
			if (stateCall === 4) return [true, vi.fn()];
			if (stateCall === 6) return ["wallet", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionsScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(screenList.props.data).toHaveLength(1);
		expect(screenList.props.data[0].id).toBe("t2");
	});

	it.each([
		["amount", "2000", { amount: "2,000" }],
		["category", "gro", { categoryName: "Groceries" }],
		["trip", "goa", { tripName: "Goa" }],
		["investment", "mf", { investmentName: "MF" }],
		["date", "date:45", { transactionAt: 45 }],
		[
			"formatted money",
			"inr 2000",
			{ amount: "2,000", sourceCurrencyCode: "inr" },
		],
	] as const)(
		"covers search match branch: %s",
		async (_label, query, overrides) => {
			const navigation = { navigate: vi.fn(), setOptions: vi.fn() };

			let stateCall = 0;
			reactMocks.useState.mockImplementation((initial: any) => {
				stateCall += 1;
				if (stateCall === 1) {
					return [
						[
							{
								id: "t-branch",
								classification: "GENERAL",
								amount: "100",
								sourceName: "Wallet",
								sourceCurrencyCode: "USD",
								transactionAt: 20,
								reason: "alpha",
								...overrides,
							},
						],
						vi.fn(),
					];
				}
				if (stateCall === 2) return ["ALL", vi.fn()];
				if (stateCall === 4) return [true, vi.fn()];
				if (stateCall === 6) return [query, vi.fn()];
				return [
					typeof initial === "function" ? initial() : initial,
					vi.fn(),
				];
			});

			const tree = TransactionsScreen({ navigation } as any);
			await flush();

			const screenList = findByPredicate(
				tree,
				(node) => typeof node?.props?.data !== "undefined",
			)[0];
			expect(screenList.props.data).toHaveLength(1);
			expect(screenList.props.data[0].id).toBe("t-branch");
		},
	);

	it("covers search no-match branch and close-search header icon branch", async () => {
		const setOptions = vi.fn();
		const navigation = { navigate: vi.fn(), setOptions };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "t-none",
							classification: "GENERAL",
							amount: "100",
							sourceName: "Wallet",
							sourceCurrencyCode: "USD",
							transactionAt: 20,
							reason: "alpha",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["ALL", vi.fn()];
			if (stateCall === 4) return [true, vi.fn()];
			if (stateCall === 6) return ["zzz", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionsScreen({ navigation } as any);
		await flush();

		const headerRight = setOptions.mock.calls[0][0].headerRight;
		const header = headerRight();
		expect(
			findByPredicate(
				header,
				(node) =>
					node?.props?.accessibilityLabel === "Close search" &&
					node?.props?.icon === "close-outline",
			),
		).not.toHaveLength(0);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(screenList.props.data).toHaveLength(0);
	});
});
