import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn((effect: () => void) => effect()),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getLinkedTransactions: vi.fn(),
	deleteSource: vi.fn(),
	deleteCategory: vi.fn(),
	deleteTrip: vi.fn(),
	deleteInvestment: vi.fn(),
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
		useMemo: reactMocks.useMemo,
		useState: reactMocks.useState,
	};
});

vi.mock("@expo/vector-icons", () => ({
	Ionicons: (props: any) => ({ type: "Ionicons", props }),
}));

vi.mock("react-native", () => ({
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("@/components/AppButton", () => ({
	default: (props: any) => ({ type: "AppButton", props }),
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
vi.mock("@/components/ListHeader", () => ({
	default: (props: any) => ({ type: "ListHeader", props }),
}));
vi.mock("@/components/Notice", () => ({
	default: (props: any) => ({ type: "Notice", props }),
}));
vi.mock("@/components/ScreenList", () => ({
	default: (props: any) => ({ type: "ScreenList", props }),
}));
vi.mock("@/components/TransactionCard", () => ({
	default: (props: any) => ({ type: "TransactionCard", props }),
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
		dataVersion: 1,
		refreshData: hookMocks.refreshData,
	}),
}));

vi.mock("@/services/transactionService", () => ({
	default: { getLinkedTransactions: serviceMocks.getLinkedTransactions },
}));
vi.mock("@/services/sourceService", () => ({
	default: { deleteSource: serviceMocks.deleteSource },
}));
vi.mock("@/services/categoryService", () => ({
	default: { deleteCategory: serviceMocks.deleteCategory },
}));
vi.mock("@/services/tripService", () => ({
	default: { deleteTrip: serviceMocks.deleteTrip },
}));
vi.mock("@/services/investmentService", () => ({
	default: { deleteInvestment: serviceMocks.deleteInvestment },
}));

vi.mock("@/utils/relation", () => ({
	default: (kind: string) => ({
		title: `${kind} title`,
		singular: kind.toLowerCase(),
	}),
}));
vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/runAfterRender", () => ({
	default: (fn: () => void) => fn(),
}));

import LinkedTransactionsScreen from "@/screens/LinkedTransactionsScreen";

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

describe("LinkedTransactionsScreen", () => {
	beforeEach(() => {
		reactMocks.useState.mockReset();
		reactMocks.useState.mockImplementation((initial: any) => [
			typeof initial === "function" ? initial() : initial,
			vi.fn(),
		]);
		Object.values(serviceMocks).forEach((mockFn) => mockFn.mockReset());
		Object.values(hookMocks).forEach((mockFn) => mockFn.mockReset());
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);
		serviceMocks.getLinkedTransactions.mockResolvedValue([
			{ id: "tx1", transactionAt: 100 },
		]);
		serviceMocks.deleteSource.mockResolvedValue(undefined);
		serviceMocks.deleteCategory.mockResolvedValue(undefined);
		serviceMocks.deleteTrip.mockResolvedValue(undefined);
		serviceMocks.deleteInvestment.mockResolvedValue(undefined);
	});

	it("covers edit and transaction navigation plus key extractor", async () => {
		const navigation = { navigate: vi.fn(), goBack: vi.fn() };
		const tree = LinkedTransactionsScreen({
			navigation,
			route: {
				key: "k",
				name: "LinkedTransactions",
				params: {
					entityId: "e1",
					entityName: "Entity",
					kind: "CATEGORY",
				},
			},
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Edit" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();

		const screenList = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.renderItem === "function" &&
				typeof node?.props?.keyExtractor === "function",
		)[0];
		expect(screenList.props.keyExtractor({ id: "tx9" })).toBe("tx9");

		const rendered = screenList.props.renderItem({
			item: { id: "tx9", transactionAt: 125 },
		});
		findByPredicate(
			rendered,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();

		expect(navigation.navigate).toHaveBeenCalledWith("RelationForm", {
			kind: "CATEGORY",
			entityId: "e1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("TransactionForm", {
			transactionId: "tx9",
		});
	});

	it("covers load and delete error branches", async () => {
		const navigation = { navigate: vi.fn(), goBack: vi.fn() };
		const setError = vi.fn();
		serviceMocks.getLinkedTransactions.mockRejectedValueOnce(
			new Error("load failed"),
		);
		serviceMocks.deleteSource.mockRejectedValueOnce(
			new Error("cannot delete"),
		);

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 2) return ["", setError];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = LinkedTransactionsScreen({
			navigation,
			route: {
				key: "k2",
				name: "LinkedTransactions",
				params: {
					entityId: "e1",
					entityName: "Entity",
					kind: "SOURCE",
					dateRangeLabel: "This month",
				},
			},
		} as any);
		await flush();

		expect(setError).toHaveBeenCalledWith("load failed");

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Delete" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.deleteSource).toHaveBeenCalledWith(
			{ id: "db" },
			"e1",
		);
		expect(hookMocks.showMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Unable to delete",
				message: "cannot delete",
				variant: "danger",
			}),
		);
		expect(hookMocks.refreshData).not.toHaveBeenCalled();
		expect(navigation.goBack).not.toHaveBeenCalled();
	});

	it("filters linked transactions by provided date range", async () => {
		const setTransactions = vi.fn();
		serviceMocks.getLinkedTransactions.mockResolvedValueOnce([
			{ id: "tx-old", transactionAt: 100 },
			{ id: "tx-in", transactionAt: 200 },
			{ id: "tx-new", transactionAt: 300 },
		]);

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[], setTransactions];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		LinkedTransactionsScreen({
			navigation: { navigate: vi.fn(), goBack: vi.fn() },
			route: {
				key: "k3",
				name: "LinkedTransactions",
				params: {
					entityId: "e1",
					entityName: "Entity",
					kind: "SOURCE",
					dateRangeStart: 150,
					dateRangeEnd: 250,
				},
			},
		} as any);
		await flush();

		expect(setTransactions).toHaveBeenCalledWith([
			{ id: "tx-in", transactionAt: 200 },
		]);
	});

	it.each([
		["CATEGORY", "deleteCategory"],
		["TRIP", "deleteTrip"],
		["INVESTMENT", "deleteInvestment"],
	] as const)(
		"deletes linked relation successfully for %s",
		async (kind, deleteKey) => {
			const navigation = { navigate: vi.fn(), goBack: vi.fn() };
			const tree = LinkedTransactionsScreen({
				navigation,
				route: {
					key: `k-${kind}`,
					name: "LinkedTransactions",
					params: {
						entityId: "e1",
						entityName: "Entity",
						kind,
					},
				},
			} as any);
			await flush();

			findByPredicate(
				tree,
				(node) =>
					node?.props?.label === "Delete" &&
					typeof node?.props?.onPress === "function",
			)[0]?.props?.onPress();
			await flush();

			expect(serviceMocks[deleteKey]).toHaveBeenCalledWith(
				{ id: "db" },
				"e1",
			);
			expect(hookMocks.refreshData).toHaveBeenCalled();
			expect(navigation.goBack).toHaveBeenCalled();
		},
	);
});
