import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getAnalysisSummary: vi.fn(),
	getBudgets: vi.fn(),
	deleteBudget: vi.fn(),
	getNotes: vi.fn(),
	getTodos: vi.fn(),
	toggleTodo: vi.fn(),
	fetchExchangeRates: vi.fn(),
	getExchangeRates: vi.fn(),
	saveManualExchangeRate: vi.fn(),
	getSources: vi.fn(),
	getArchivedSources: vi.fn(),
	setSourceArchived: vi.fn(),
	getArchivedCategories: vi.fn(),
	setCategoryArchived: vi.fn(),
	getArchivedTrips: vi.fn(),
	setTripArchived: vi.fn(),
	getArchivedInvestments: vi.fn(),
	setInvestmentArchived: vi.fn(),
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
	handleDeleteFolder: vi.fn(),
	handleRenameFolder: vi.fn(),
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
	ScrollView: (props: any) => ({ type: "ScrollView", props }),
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
vi.mock("@/components/FloatingAddButton", () => ({
	default: (props: any) => ({ type: "FloatingAddButton", props }),
}));
vi.mock("@/components/FolderFilterChips", () => ({
	default: (props: any) => ({ type: "FolderFilterChips", props }),
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
vi.mock("@/components/TextField", () => ({
	default: (props: any) => ({ type: "TextField", props }),
}));
vi.mock("@/components/TransactionCard", () => ({
	default: (props: any) => ({ type: "TransactionCard", props }),
}));

vi.mock("@/hooks/useAppDialog", () => ({
	default: () => ({ confirm: hookMocks.confirm, showMessage: hookMocks.showMessage }),
}));
vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({ database: { id: "db" }, dataVersion: 1, refreshData: hookMocks.refreshData }),
}));
vi.mock("@/hooks/useFolders", () => ({
	default: () => ({
		folders: [{ id: "f1", name: "Home" }],
		handleDeleteFolder: hookMocks.handleDeleteFolder,
		handleRenameFolder: hookMocks.handleRenameFolder,
	}),
}));

vi.mock("@/services/analysisService", () => ({
	default: { getAnalysisSummary: serviceMocks.getAnalysisSummary },
}));
vi.mock("@/services/budgetService", () => ({
	default: { getBudgets: serviceMocks.getBudgets, deleteBudget: serviceMocks.deleteBudget },
}));
vi.mock("@/services/noteService", () => ({
	default: { getNotes: serviceMocks.getNotes },
}));
vi.mock("@/services/exchangeRateService", () => ({
	default: {
		fetchExchangeRates: serviceMocks.fetchExchangeRates,
		getExchangeRates: serviceMocks.getExchangeRates,
		saveManualExchangeRate: serviceMocks.saveManualExchangeRate,
	},
}));
vi.mock("@/services/sourceService", () => ({
	default: {
		getSources: serviceMocks.getSources,
		getArchivedSources: serviceMocks.getArchivedSources,
		setSourceArchived: serviceMocks.setSourceArchived,
		deleteSource: serviceMocks.deleteSource,
	},
}));
vi.mock("@/services/categoryService", () => ({
	default: {
		getArchivedCategories: serviceMocks.getArchivedCategories,
		setCategoryArchived: serviceMocks.setCategoryArchived,
		deleteCategory: serviceMocks.deleteCategory,
	},
}));
vi.mock("@/services/tripService", () => ({
	default: {
		getArchivedTrips: serviceMocks.getArchivedTrips,
		setTripArchived: serviceMocks.setTripArchived,
		deleteTrip: serviceMocks.deleteTrip,
	},
}));
vi.mock("@/services/investmentService", () => ({
	default: {
		getArchivedInvestments: serviceMocks.getArchivedInvestments,
		setInvestmentArchived: serviceMocks.setInvestmentArchived,
		deleteInvestment: serviceMocks.deleteInvestment,
	},
}));
vi.mock("@/services/transactionService", () => ({
	default: {
		getLinkedTransactions: serviceMocks.getLinkedTransactions,
	},
}));
vi.mock("@/services/todoService", () => ({
	default: {
		getTodos: serviceMocks.getTodos,
		toggleTodo: serviceMocks.toggleTodo,
	},
}));

vi.mock("@/utils/relation", () => ({
	default: (kind: string) => ({
		title: `${kind} TITLE`,
		singular: kind.toLowerCase(),
	}),
}));

vi.mock("@/utils/date", () => ({
	default: {
		formatDate: (value: number) => `date:${value}`,
		formatDateTime: (value: number) => `datetime:${value}`,
		getAnalysisDateRange: (period: string) => ({ start: period.length, end: 999 }),
	},
}));
vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/money", () => ({
	default: {
		compareMoney: (a: string, b: string) => Number(a) - Number(b),
		formatMoney: (amount: string, code: string) => `${code} ${amount}`,
		subtractMoney: (a: string, b: string) => String(Number(a) - Number(b)),
		ZERO_AMOUNT: "0",
	},
}));
vi.mock("@/utils/runAfterRender", () => ({
	default: (fn: () => void) => fn(),
}));

import BudgetsScreen from "@/screens/BudgetsScreen";
import ArchivedRelationsScreen from "@/screens/ArchivedRelationsScreen";
import ExchangeRatesScreen from "@/screens/ExchangeRatesScreen";
import LinkedTransactionsScreen from "@/screens/LinkedTransactionsScreen";
import NotesScreen from "@/screens/NotesScreen";
import TodosScreen from "@/screens/TodosScreen";

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

describe("list screens", () => {
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
		Object.values(hookMocks).forEach((mockFn) => mockFn.mockReset());

		serviceMocks.getAnalysisSummary.mockResolvedValue({
			categories: [
				{
					categoryId: "c1",
					currencyCode: "INR",
					credits: "100",
					debits: "10",
				},
			],
		});
		serviceMocks.getBudgets.mockResolvedValue([{ id: "b1" }]);
		serviceMocks.deleteBudget.mockResolvedValue(undefined);
		serviceMocks.getNotes.mockResolvedValue([{ id: "n1" }]);
		serviceMocks.getTodos.mockResolvedValue([{ id: "t1" }]);
		serviceMocks.toggleTodo.mockResolvedValue(undefined);
		serviceMocks.fetchExchangeRates.mockResolvedValue(2);
		serviceMocks.getExchangeRates.mockResolvedValue([
			{
				currencyCode: "USD",
				rateToInr: "83.5",
				source: "manual",
				fetchedAt: 1,
				updatedAt: 2,
			},
		]);
		serviceMocks.saveManualExchangeRate.mockResolvedValue(undefined);
		serviceMocks.getSources.mockResolvedValue([
			{ currencyCode: "USD" },
			{ currencyCode: "INR" },
		]);
		serviceMocks.getArchivedSources.mockResolvedValue([{ id: "s1", name: "Cash" }]);
		serviceMocks.getArchivedCategories.mockResolvedValue([
			{ id: "c1", name: "Food" },
		]);
		serviceMocks.getArchivedTrips.mockResolvedValue([{ id: "t1", name: "Goa" }]);
		serviceMocks.getArchivedInvestments.mockResolvedValue([
			{ id: "i1", name: "MF" },
		]);
		serviceMocks.setSourceArchived.mockResolvedValue(undefined);
		serviceMocks.setCategoryArchived.mockResolvedValue(undefined);
		serviceMocks.setTripArchived.mockResolvedValue(undefined);
		serviceMocks.setInvestmentArchived.mockResolvedValue(undefined);
		serviceMocks.getLinkedTransactions.mockResolvedValue([
			{ id: "tx1", transactionAt: 100 },
			{ id: "tx2", transactionAt: 300 },
		]);
		serviceMocks.deleteSource.mockResolvedValue(undefined);
		serviceMocks.deleteCategory.mockResolvedValue(undefined);
		serviceMocks.deleteTrip.mockResolvedValue(undefined);
		serviceMocks.deleteInvestment.mockResolvedValue(undefined);
	});

	it("executes ExchangeRatesScreen fetch and manual save flows", async () => {
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [["USD"], vi.fn()];
			if (call === 2)
				return [
					[
						{
							currencyCode: "USD",
							rateToInr: "83.5",
							source: "manual",
							fetchedAt: 1,
							updatedAt: 2,
						},
					],
					vi.fn(),
				];
			if (call === 3) return [{ USD: "84" }, vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = ExchangeRatesScreen({} as any);
		await flush();

		findByPredicate(
			tree,
			(node) => node?.props?.label === "Fetch latest rates" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		const screenList = findByPredicate(tree, (node) => typeof node?.props?.renderItem === "function")[0];
		const row = screenList.props.renderItem({ item: "USD" });
		findByPredicate(
			row,
			(node) => node?.props?.label === "Save manual rate" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.fetchExchangeRates).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.saveManualExchangeRate).toHaveBeenCalledWith(
			{ id: "db" },
			"USD",
			"84",
		);
		expect(hookMocks.refreshData).toHaveBeenCalled();
	});

	it("executes ArchivedRelationsScreen list and restore flow", async () => {
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => onConfirm());

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[{ id: "s1", name: "Cash" }], vi.fn()];
			if (call === 2) return [[{ id: "c1", name: "Food" }], vi.fn()];
			if (call === 3) return [[{ id: "t1", name: "Goa" }], vi.fn()];
			if (call === 4) return [[{ id: "i1", name: "MF" }], vi.fn()];
			if (call === 6) return ["", vi.fn()];
			if (call === 7) return ["", vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = ArchivedRelationsScreen({} as any);
		await flush();

		const screenList = findByPredicate(tree, (node) => typeof node?.props?.renderItem === "function")[0];
		const entityRow = screenList.props.data.find((row: any) => row.type === "entity");
		const rendered = screenList.props.renderItem({ item: entityRow });
		findByPredicate(
			rendered,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.getArchivedSources).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getArchivedCategories).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getArchivedTrips).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getArchivedInvestments).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.setSourceArchived).toHaveBeenCalledWith({ id: "db" }, "s1", false);
		expect(hookMocks.refreshData).toHaveBeenCalled();
	});

	it.each([
		["SOURCE", "deleteSource"],
		["CATEGORY", "deleteCategory"],
		["TRIP", "deleteTrip"],
		["INVESTMENT", "deleteInvestment"],
	] as const)(
		"executes LinkedTransactionsScreen delete flow for %s",
		async (kind, deleteKey) => {
			const navigation = { navigate: vi.fn(), goBack: vi.fn() };
			hookMocks.confirm.mockImplementation(({ onConfirm }: any) => onConfirm());

			let call = 0;
			reactMocks.useState.mockImplementation((initial: any) => {
				call += 1;
				if (call === 1) {
					return [[{ id: "tx1", transactionAt: 100 }], vi.fn()];
				}
				return [typeof initial === "function" ? initial() : initial, vi.fn()];
			});

			const tree = LinkedTransactionsScreen({
				navigation,
				route: {
					key: "k",
					name: "LinkedTransactions",
					params: {
						entityId: "e1",
						entityName: "Entity",
						kind,
						dateRangeStart: 50,
						dateRangeEnd: 150,
						dateRangeLabel: "This month",
					},
				},
			} as any);
			await flush();

			findByPredicate(
				tree,
				(node) => node?.props?.label === "Delete" && typeof node?.props?.onPress === "function",
			)[0]?.props?.onPress();
			await flush();

			expect(serviceMocks.getLinkedTransactions).toHaveBeenCalledWith(
				{ id: "db" },
				{ entityId: "e1", kind },
			);
			expect(serviceMocks[deleteKey]).toHaveBeenCalledWith({ id: "db" }, "e1");
			expect(hookMocks.refreshData).toHaveBeenCalled();
			expect(navigation.goBack).toHaveBeenCalled();
		},
	);

	it("executes BudgetsScreen render and delete flows", async () => {
		const navigation = { navigate: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => onConfirm());

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) {
				return [
					[
						{
							id: "b1",
							categoryId: "c1",
							categoryName: "Food",
							amount: "50",
							period: "MONTHLY",
						},
					],
					vi.fn(),
				];
			}
			if (call === 2 || call === 3) {
				return [
					{
						categories: [
							{
								categoryId: "c1",
								currencyCode: "INR",
								credits: "100",
								debits: "10",
							},
						],
					},
					vi.fn(),
				];
			}
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = BudgetsScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(tree, (node) => typeof node?.props?.renderItem === "function")[0];
		const renderedItem = screenList.props.renderItem({
			item: {
				id: "b1",
				categoryId: "c1",
				categoryName: "Food",
				amount: "50",
				period: "MONTHLY",
			},
		});

		findByPredicate(
			renderedItem,
			(node) => node?.props?.label === "Edit" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		findByPredicate(
			renderedItem,
			(node) => node?.props?.label === "Delete" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.getBudgets).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getAnalysisSummary).toHaveBeenCalledTimes(2);
		expect(serviceMocks.deleteBudget).toHaveBeenCalledWith({ id: "db" }, "b1");
		expect(hookMocks.refreshData).toHaveBeenCalled();
		expect(navigation.navigate).toHaveBeenCalled();
	});

	it("executes NotesScreen render and folder actions", async () => {
		const navigation = { navigate: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => onConfirm());

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) {
				return [
					[
						{
							id: "n1",
							title: "Title",
							content: "Body",
							folderId: "f1",
							folderName: "Home",
							hasAttachment: true,
							updatedAt: 100,
						},
					],
					vi.fn(),
				];
			}
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = NotesScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(tree, (node) => typeof node?.props?.renderItem === "function")[0];
		screenList.props.renderItem({
			item: {
				id: "n1",
				title: "Title",
				content: "Body",
				folderId: "f1",
				folderName: "Home",
				hasAttachment: true,
				updatedAt: 100,
			},
		});

		const folderChips = findByPredicate(tree, (node) => typeof node?.props?.onDeleteFolder === "function")[0];
		folderChips.props.onDeleteFolder({ id: "f1", name: "Home" });
		folderChips.props.onRenameFolder({ id: "f1", name: "Home" }, "Work");
		await flush();

		expect(serviceMocks.getNotes).toHaveBeenCalledWith({ id: "db" });
		expect(hookMocks.handleDeleteFolder).toHaveBeenCalledWith("f1");
		expect(hookMocks.handleRenameFolder).toHaveBeenCalledWith("f1", "Work");
	});

	it("executes TodosScreen render toggle and folder actions", async () => {
		const navigation = { navigate: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => onConfirm());

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) {
				return [
					[
						{
							id: "t1",
							title: "Todo",
							description: "Desc",
							folderId: "f1",
							folderName: "Home",
							hasAttachment: true,
							isDone: false,
							dueAt: 200,
						},
					],
					vi.fn(),
				];
			}
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = TodosScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(tree, (node) => typeof node?.props?.renderItem === "function")[0];
		const renderedItem = screenList.props.renderItem({
			item: {
				id: "t1",
				title: "Todo",
				description: "Desc",
				folderId: "f1",
				folderName: "Home",
				hasAttachment: true,
				isDone: false,
				dueAt: 200,
			},
		});

		findByPredicate(
			renderedItem,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((pressable) => {
			pressable.props.onPress();
		});
		await flush();

		const folderChips = findByPredicate(tree, (node) => typeof node?.props?.onDeleteFolder === "function")[0];
		folderChips.props.onDeleteFolder({ id: "f1", name: "Home" });
		folderChips.props.onRenameFolder({ id: "f1", name: "Home" }, "Work");
		await flush();

		expect(serviceMocks.getTodos).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.toggleTodo).toHaveBeenCalledWith({ id: "db" }, "t1");
		expect(hookMocks.refreshData).toHaveBeenCalled();
		expect(hookMocks.handleDeleteFolder).toHaveBeenCalledWith("f1");
		expect(hookMocks.handleRenameFolder).toHaveBeenCalledWith("f1", "Work");
	});
});
