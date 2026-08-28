import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn((effect: () => void | (() => void)) => {
		const cleanup = effect();
		if (typeof cleanup === "function") cleanup();
	}),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getArchivedSources: vi.fn(),
	getArchivedCategories: vi.fn(),
	getArchivedTrips: vi.fn(),
	getArchivedInvestments: vi.fn(),
	setSourceArchived: vi.fn(),
	setCategoryArchived: vi.fn(),
	setTripArchived: vi.fn(),
	setInvestmentArchived: vi.fn(),
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

vi.mock("@/services/sourceService", () => ({
	default: {
		getArchivedSources: serviceMocks.getArchivedSources,
		setSourceArchived: serviceMocks.setSourceArchived,
	},
}));
vi.mock("@/services/categoryService", () => ({
	default: {
		getArchivedCategories: serviceMocks.getArchivedCategories,
		setCategoryArchived: serviceMocks.setCategoryArchived,
	},
}));
vi.mock("@/services/tripService", () => ({
	default: {
		getArchivedTrips: serviceMocks.getArchivedTrips,
		setTripArchived: serviceMocks.setTripArchived,
	},
}));
vi.mock("@/services/investmentService", () => ({
	default: {
		getArchivedInvestments: serviceMocks.getArchivedInvestments,
		setInvestmentArchived: serviceMocks.setInvestmentArchived,
	},
}));

vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/relation", () => ({
	default: (kind: string) => ({
		title: `${kind} TITLE`,
		singular: kind.toLowerCase(),
	}),
}));

import ArchivedRelationsScreen from "@/screens/ArchivedRelationsScreen";

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

describe("ArchivedRelationsScreen", () => {
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

		serviceMocks.getArchivedSources.mockResolvedValue([]);
		serviceMocks.getArchivedCategories.mockResolvedValue([]);
		serviceMocks.getArchivedTrips.mockResolvedValue([]);
		serviceMocks.getArchivedInvestments.mockResolvedValue([]);
		serviceMocks.setSourceArchived.mockResolvedValue(undefined);
		serviceMocks.setCategoryArchived.mockResolvedValue(undefined);
		serviceMocks.setTripArchived.mockResolvedValue(undefined);
		serviceMocks.setInvestmentArchived.mockResolvedValue(undefined);
	});

	it("covers category and trip restore branches with keyExtractor", async () => {
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[], vi.fn()];
			if (call === 2) return [[{ id: "c1", name: "Food" }], vi.fn()];
			if (call === 3) return [[{ id: "t1", name: "Goa" }], vi.fn()];
			if (call === 4) return [[], vi.fn()];
			if (call === 6) return ["", vi.fn()];
			if (call === 7) return ["", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ArchivedRelationsScreen({} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.renderItem === "function" &&
				typeof node?.props?.keyExtractor === "function",
		)[0];
		expect(screenList.props.keyExtractor({ key: "CATEGORY-c1" })).toBe(
			"CATEGORY-c1",
		);

		const categoryRow = screenList.props.data.find(
			(row: any) => row.kind === "CATEGORY",
		);
		const categoryRendered = screenList.props.renderItem({
			item: categoryRow,
		});
		findByPredicate(
			categoryRendered,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		expect(serviceMocks.setCategoryArchived).toHaveBeenCalledWith(
			{ id: "db" },
			"c1",
			false,
		);

		const tripRow = screenList.props.data.find(
			(row: any) => row.kind === "TRIP",
		);
		const tripRendered = screenList.props.renderItem({ item: tripRow });
		findByPredicate(
			tripRendered,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		expect(serviceMocks.setTripArchived).toHaveBeenCalledWith(
			{ id: "db" },
			"t1",
			false,
		);
		expect(hookMocks.refreshData).toHaveBeenCalled();
	});

	it("covers load and restore error branches", async () => {
		const setError = vi.fn();
		serviceMocks.getArchivedSources.mockRejectedValueOnce(
			new Error("load failed"),
		);
		serviceMocks.setInvestmentArchived.mockRejectedValueOnce(
			new Error("cannot restore"),
		);

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[], vi.fn()];
			if (call === 2) return [[], vi.fn()];
			if (call === 3) return [[], vi.fn()];
			if (call === 4) return [[{ id: "i1", name: "MF" }], vi.fn()];
			if (call === 5) return ["", setError];
			if (call === 6) return ["mf", vi.fn()];
			if (call === 7) return ["mf", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ArchivedRelationsScreen({} as any);
		await flush();
		expect(setError).toHaveBeenCalledWith("load failed");

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const investmentRow = screenList.props.data.find(
			(row: any) => row.kind === "INVESTMENT",
		);
		const investmentRendered = screenList.props.renderItem({
			item: investmentRow,
		});
		findByPredicate(
			investmentRendered,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.setInvestmentArchived).toHaveBeenCalledWith(
			{ id: "db" },
			"i1",
			false,
		);
		expect(hookMocks.showMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Unable to restore",
				message: "cannot restore",
				variant: "danger",
			}),
		);
	});

	it("covers debounced search timer callback", async () => {
		const setSearchDebounced = vi.fn();
		vi.spyOn(globalThis, "setTimeout").mockImplementation(((fn: any) => {
			fn();
			return 123;
		}) as any);

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 7) return ["term", setSearchDebounced];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		ArchivedRelationsScreen({} as any);
		await flush();

		expect(setSearchDebounced).toHaveBeenCalledWith("");
	});
});
