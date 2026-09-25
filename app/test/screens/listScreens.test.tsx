import type AppButtonProps from "@/types/AppButtonProps";
import type AppDialogConfirmOptions from "@/types/AppDialogConfirmOptions";
import type Category from "@/types/Category";
import type GlassCardProps from "@/types/GlassCardProps";
import type HeaderIconButtonProps from "@/types/HeaderIconButtonProps";
import type InvestmentListItem from "@/types/InvestmentListItem";
import type NoticeProps from "@/types/NoticeProps";
import type SegmentedControlProps from "@/types/SegmentedControlProps";
import type Source from "@/types/Source";
import type ActionProps from "@test/types/ActionProps";
import type FinanceListProps from "@test/types/FinanceListProps";
import type FinanceTestItem from "@test/types/FinanceTestItem";
import type HeaderOptions from "@test/types/HeaderOptions";
import type SourceListTestProps from "@test/types/SourceListTestProps";
import {
	isValidElement,
	type PropsWithChildren,
	type ReactElement,
} from "react";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
	type Mock,
} from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useLayoutEffect: vi.fn<(effect: () => void) => void>(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const navigationMocks = vi.hoisted(() => ({
	useFocusEffect: vi.fn((callback: () => void) => callback()),
}));

const serviceMocks = vi.hoisted(() => ({
	getAnalysisSummary: vi.fn(),
	getInvestmentNetAmount: vi.fn(),
	getInvestmentNetLabel: vi.fn(),
	getCategories: vi.fn(),
	getInvestments: vi.fn(),
	getTrips: vi.fn(),
	getTripTotals: vi.fn(),
	getNativeCurrencyDisplay: vi.fn(),
	updateNativeCurrencyDisplay: vi.fn(),
	getBudgets: vi.fn(),
	deleteBudget: vi.fn(),
	getNotes: vi.fn(),
	getTodos: vi.fn(),
	toggleTodo: vi.fn(),
	fetchExchangeRates: vi.fn(),
	getExchangeRates: vi.fn(),
	saveManualExchangeRate: vi.fn(),
	getSources: vi.fn(),
	validateSource: vi.fn(),
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

const folderState = vi.hoisted(() => ({
	folders: [{ id: "f1", name: "Home" }],
}));

vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react")>();
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
	useFocusEffect: navigationMocks.useFocusEffect,
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
vi.mock("@/hooks/useFolders", () => ({
	default: () => ({
		folders: folderState.folders,
		handleDeleteFolder: hookMocks.handleDeleteFolder,
		handleRenameFolder: hookMocks.handleRenameFolder,
	}),
}));

vi.mock("@/services/analysisService", () => ({
	default: {
		getAnalysisSummary: serviceMocks.getAnalysisSummary,
		getInvestmentNetAmount: serviceMocks.getInvestmentNetAmount,
		getInvestmentNetLabel: serviceMocks.getInvestmentNetLabel,
	},
}));
vi.mock("@/services/budgetService", () => ({
	default: {
		getBudgets: serviceMocks.getBudgets,
		deleteBudget: serviceMocks.deleteBudget,
	},
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
		validateSource: serviceMocks.validateSource,
		getArchivedSources: serviceMocks.getArchivedSources,
		setSourceArchived: serviceMocks.setSourceArchived,
		deleteSource: serviceMocks.deleteSource,
	},
}));
vi.mock("@/services/categoryService", () => ({
	default: {
		getCategories: serviceMocks.getCategories,
		getArchivedCategories: serviceMocks.getArchivedCategories,
		setCategoryArchived: serviceMocks.setCategoryArchived,
		deleteCategory: serviceMocks.deleteCategory,
	},
}));
vi.mock("@/services/tripService", () => ({
	default: {
		getTrips: serviceMocks.getTrips,
		getArchivedTrips: serviceMocks.getArchivedTrips,
		setTripArchived: serviceMocks.setTripArchived,
		deleteTrip: serviceMocks.deleteTrip,
	},
}));
vi.mock("@/services/investmentService", () => ({
	default: {
		getInvestments: serviceMocks.getInvestments,
		getArchivedInvestments: serviceMocks.getArchivedInvestments,
		setInvestmentArchived: serviceMocks.setInvestmentArchived,
		deleteInvestment: serviceMocks.deleteInvestment,
	},
}));
vi.mock("@/services/settingsService", () => ({
	default: {
		getNativeCurrencyDisplay: serviceMocks.getNativeCurrencyDisplay,
		updateNativeCurrencyDisplay: serviceMocks.updateNativeCurrencyDisplay,
	},
}));
vi.mock("@/services/tripTotalService", () => ({
	default: { getTripTotals: serviceMocks.getTripTotals },
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
		getAnalysisDateRange: (period: string) => ({
			start: period.length,
			end: 999,
		}),
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

import ArchivedRelationsScreen from "@/screens/ArchivedRelationsScreen";
import BudgetsScreen from "@/screens/BudgetsScreen";
import CategoriesScreen from "@/screens/CategoriesScreen";
import ExchangeRatesScreen from "@/screens/ExchangeRatesScreen";
import InvestmentsScreen from "@/screens/InvestmentsScreen";
import LinkedTransactionsScreen from "@/screens/LinkedTransactionsScreen";
import NotesScreen from "@/screens/NotesScreen";
import SourcesScreen from "@/screens/SourcesScreen";
import TodosScreen from "@/screens/TodosScreen";
import TripsScreen from "@/screens/TripsScreen";

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

const findElement = <Props,>(
	tree: unknown,
	predicate: (props: Props) => boolean,
): ReactElement<Props> => {
	const [element] = findByPredicate(
		tree,
		(candidate: unknown) =>
			isValidElement<Props>(candidate) && predicate(candidate.props),
	) as ReactElement<Props>[];
	if (!element) throw new Error("Expected element was not found");
	return element;
};

const mockStateValues = (
	values: Record<number, unknown>,
): Map<number, Mock<(value: unknown) => void>> => {
	let stateIndex = 0;
	const setters = new Map<number, Mock<(value: unknown) => void>>();
	reactMocks.useState.mockImplementation((initial: unknown) => {
		stateIndex += 1;
		const setter = vi.fn<(value: unknown) => void>();
		setters.set(stateIndex, setter);
		return [
			stateIndex in values
				? values[stateIndex]
				: typeof initial === "function"
					? (initial as () => unknown)()
					: initial,
			setter,
		];
	});
	return setters;
};

describe("list screens", () => {
	beforeEach(() => {
		reactMocks.useEffect.mockReset();
		reactMocks.useLayoutEffect.mockReset();
		reactMocks.useState.mockReset();
		navigationMocks.useFocusEffect.mockClear();
		reactMocks.useEffect.mockImplementation((effect: () => void) => {
			effect();
		});
		reactMocks.useState.mockImplementation((initial: any) => [
			typeof initial === "function" ? initial() : initial,
			vi.fn(),
		]);

		Object.values(serviceMocks).forEach((mockFn) => mockFn.mockReset());
		Object.values(hookMocks).forEach((mockFn) => mockFn.mockReset());
		folderState.folders = [{ id: "f1", name: "Home" }];

		serviceMocks.getCategories.mockResolvedValue([]);
		serviceMocks.getInvestments.mockResolvedValue([]);
		serviceMocks.getTrips.mockResolvedValue([]);
		serviceMocks.getTripTotals.mockResolvedValue([]);
		serviceMocks.getNativeCurrencyDisplay.mockResolvedValue(true);
		serviceMocks.getInvestmentNetAmount.mockImplementation((net: string) =>
			String(Math.abs(Number(net))),
		);
		serviceMocks.getInvestmentNetLabel.mockReturnValue("Net");
		serviceMocks.validateSource.mockResolvedValue(undefined);
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
		serviceMocks.getArchivedSources.mockResolvedValue([
			{ id: "s1", name: "Cash" },
		]);
		serviceMocks.getArchivedCategories.mockResolvedValue([
			{ id: "c1", name: "Food" },
		]);
		serviceMocks.getArchivedTrips.mockResolvedValue([
			{ id: "t1", name: "Goa" },
		]);
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

	describe("finance list details", () => {
		const source: Source = {
			id: "cash",
			name: "Cash",
			currencyCode: "INR",
			balance: "5",
			validatedAt: null,
			latestTransactionCreatedAt: 2,
			createdAt: 1,
			updatedAt: 1,
			archived: false,
		};
		const sources: readonly Source[] = [
			source,
			{
				...source,
				id: "positive",
				name: "Positive",
				currencyCode: "USD",
				balance: "10",
				validatedAt: 3,
			},
			{
				...source,
				id: "negative",
				name: "Negative",
				currencyCode: "USD",
				balance: "-10",
				validatedAt: 1,
			},
			{
				...source,
				id: "unknown",
				name: "Unknown",
				currencyCode: "ZZZ",
				balance: "100",
				validatedAt: 1,
				latestTransactionCreatedAt: null,
			},
			{
				...source,
				id: "zero",
				name: "Zero",
				currencyCode: "USD",
				balance: "0",
			},
		];
		const trips = [
			{ id: "spent", name: "Holiday" },
			{ id: "refund", name: "Refund" },
			{ id: "empty", name: "Empty" },
			{ id: "unknown", name: "Unknown" },
		];
		const investments = [
			{
				id: "redeemed",
				name: "Redeemed",
				label: "Long term",
				investmentTypeName: "Equity",
			},
			{
				id: "invested",
				name: "Invested",
				label: " Long term ",
				investmentTypeName: " Equity ",
			},
			{ id: "zero", name: "Zero", label: " ", investmentTypeName: " " },
			{
				id: "empty",
				name: "Empty",
				label: null,
				investmentTypeName: undefined,
			},
			{
				id: "unknown",
				name: "Unknown",
				label: undefined,
				investmentTypeName: "Debt",
			},
		];

		beforeEach(() => {
			vi.useFakeTimers();
			reactMocks.useLayoutEffect.mockImplementation((effect) => effect());
			reactMocks.useEffect.mockImplementation(
				(effect: () => () => void) => {
					const cleanup = effect();
					vi.runAllTimers();
					cleanup();
				},
			);
		});
		afterEach(() => {
			vi.useRealTimers();
		});

		it.each([true, false])(
			"sorts and renders source balances with native currency=%s",
			async (nativeCurrency) => {
				mockStateValues({
					1: sources,
					2: nativeCurrency,
					3: [{ currencyCode: "USD", rateToInr: "2" }],
				});
				const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
				const tree = (
					SourcesScreen as (props: unknown) => ReactElement
				)({ navigation });
				await flush();
				const list = findElement<FinanceListProps<Source>>(
					tree,
					(props) => Array.isArray(props.data),
				).props;
				expect(list.data.map((item) => item.id)).toEqual([
					"negative",
					"unknown",
					"zero",
					"cash",
					"positive",
				]);
				for (const item of list.data) {
					expect(list.keyExtractor(item)).toBe(item.id);
					const row = list.renderItem({ item });
					row.props.onPress();
					expect(navigation.navigate).toHaveBeenLastCalledWith(
						"LinkedTransactions",
						{
							kind: "SOURCE",
							entityId: item.id,
							entityName: item.name,
						},
					);
					for (const label of ["Validate", "Archive"]) {
						const action = findElement<ActionProps>(
							row,
							(props) => props.accessibilityLabel === label,
						).props;
						expect(action.style({ pressed: true })).not.toEqual(
							action.style({ pressed: false }),
						);
						action.onPress();
						if (label === "Archive") {
							const confirmation =
								hookMocks.confirm.mock.calls.at(
									-1,
								)?.[0] as Pick<
									AppDialogConfirmOptions,
									"onConfirm"
								>;
							confirmation.onConfirm();
						}
						await flush();
					}
					expect(
						serviceMocks.validateSource,
					).toHaveBeenLastCalledWith({ id: "db" }, item.id);
					expect(
						serviceMocks.setSourceArchived,
					).toHaveBeenLastCalledWith({ id: "db" }, item.id, true);
				}
				expect(hookMocks.refreshData).toHaveBeenCalledTimes(
					sources.length * 2,
				);
				findElement<Pick<AppButtonProps, "onPress">>(
					tree,
					(props) => typeof props.onPress === "function",
				).props.onPress();
				expect(navigation.navigate).toHaveBeenLastCalledWith(
					"SourceForm",
				);
			},
		);

		it.each([true, false])(
			"sorts and renders trip spending with native currency=%s",
			async (nativeCurrency) => {
				mockStateValues({
					1: trips,
					2: [
						{ tripId: "spent", currencyCode: "USD", total: "10" },
						{ tripId: "spent", currencyCode: "INR", total: "10" },
						{ tripId: "refund", currencyCode: "USD", total: "-5" },
						{
							tripId: "unknown",
							currencyCode: "ZZZ",
							total: "100",
						},
					],
					3: nativeCurrency,
					4: [{ currencyCode: "USD", rateToInr: "2" }],
				});
				const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
				const tree = (TripsScreen as (props: unknown) => ReactElement)({
					navigation,
				});
				await flush();
				const list = findElement<
					FinanceListProps<(typeof trips)[number]>
				>(tree, (props) => Array.isArray(props.data)).props;
				expect(list.data.map((item) => item.id)).toEqual([
					"spent",
					"empty",
					"unknown",
					"refund",
				]);
				for (const item of list.data) {
					expect(list.keyExtractor(item)).toBe(item.id);
					const row = list.renderItem({ item });
					row.props.onPress();
					expect(navigation.navigate).toHaveBeenLastCalledWith(
						"LinkedTransactions",
						{
							kind: "TRIP",
							entityId: item.id,
							entityName: item.name,
						},
					);
					const action = findElement<ActionProps>(
						row,
						(props) => props.accessibilityLabel === "Archive",
					).props;
					expect(action.style({ pressed: true })).not.toEqual(
						action.style({ pressed: false }),
					);
					action.onPress();
					const confirmation = hookMocks.confirm.mock.calls.at(
						-1,
					)?.[0] as Pick<AppDialogConfirmOptions, "onConfirm">;
					confirmation.onConfirm();
					await flush();
					expect(
						serviceMocks.setTripArchived,
					).toHaveBeenLastCalledWith({ id: "db" }, item.id, true);
				}
				expect(hookMocks.refreshData).toHaveBeenCalledTimes(
					trips.length,
				);
				findElement<Pick<AppButtonProps, "onPress">>(
					tree,
					(props) => typeof props.onPress === "function",
				).props.onPress();
				expect(navigation.navigate).toHaveBeenLastCalledWith(
					"TripForm",
				);
			},
		);

		it.each([
			{ groupBy: "NONE", nativeCurrency: true },
			{ groupBy: "NONE", nativeCurrency: false },
			{ groupBy: "LABEL", nativeCurrency: true },
			{ groupBy: "TYPE", nativeCurrency: false },
		])(
			"renders investment totals grouped by $groupBy, native=$nativeCurrency",
			async ({ groupBy, nativeCurrency }) => {
				const setters = mockStateValues({
					1: investments,
					2: {
						investments: [
							{
								investmentId: "invested",
								currencyCode: "USD",
								net: "10",
								totalInvested: "10",
								totalRedeemed: "0",
							},
							{
								investmentId: "redeemed",
								currencyCode: "INR",
								net: "-5",
								totalInvested: "5",
								totalRedeemed: "10",
							},
							{
								investmentId: "zero",
								currencyCode: "INR",
								net: "0",
								totalInvested: "0",
								totalRedeemed: "0",
							},
							{
								investmentId: "unknown",
								currencyCode: "ZZZ",
								net: "100",
								totalInvested: "100",
								totalRedeemed: "0",
							},
						],
						missingCurrencies: ["ZZZ"],
					},
					3: nativeCurrency,
					4: [{ currencyCode: "USD", rateToInr: "2" }],
					9: groupBy,
				});
				const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
				const tree = (
					InvestmentsScreen as (props: unknown) => ReactElement
				)({ navigation });
				await flush();
				const list = findElement<
					FinanceListProps<
						InvestmentListItem<(typeof investments)[number]>
					>
				>(tree, (props) => Array.isArray(props.data)).props;
				const headers = list.data
					.filter((item) => item.kind === "GROUP_HEADER")
					.map((item) => item.title);
				expect(headers).toEqual(
					groupBy === "NONE"
						? []
						: groupBy === "LABEL"
							? ["Long term", "No label"]
							: ["Debt", "Equity", "No type"],
				);
				if (groupBy === "NONE")
					expect(
						list.data
							.filter((item) => item.kind === "INVESTMENT")
							.map((item) => item.entity.id),
					).toEqual([
						"invested",
						"zero",
						"empty",
						"unknown",
						"redeemed",
					]);
				for (const item of list.data) {
					const row = list.renderItem({ item });
					if (item.kind === "GROUP_HEADER") {
						expect(list.keyExtractor(item)).toBe(
							`group:${item.title}`,
						);
						expect(
							findElement<PropsWithChildren>(
								row,
								(props) => props.children === item.title,
							),
						).toBeDefined();
						continue;
					}
					expect(list.keyExtractor(item)).toBe(item.entity.id);
					row.props.onPress();
					expect(navigation.navigate).toHaveBeenLastCalledWith(
						"LinkedTransactions",
						{
							kind: "INVESTMENT",
							entityId: item.entity.id,
							entityName: item.entity.name,
						},
					);
					const action = findElement<ActionProps>(
						row,
						(props) => props.accessibilityLabel === "Archive",
					).props;
					expect(action.style({ pressed: true })).not.toEqual(
						action.style({ pressed: false }),
					);
					action.onPress();
					const confirmation = hookMocks.confirm.mock.calls.at(
						-1,
					)?.[0] as Pick<AppDialogConfirmOptions, "onConfirm">;
					confirmation.onConfirm();
					await flush();
					expect(
						serviceMocks.setInvestmentArchived,
					).toHaveBeenLastCalledWith(
						{ id: "db" },
						item.entity.id,
						true,
					);
				}
				expect(hookMocks.refreshData).toHaveBeenCalledTimes(
					investments.length,
				);
				findElement<SegmentedControlProps>(tree, (props) =>
					Array.isArray(props.options),
				).props.onChange("TYPE");
				expect(setters.get(9)).toHaveBeenCalledWith("TYPE");
				findElement<Pick<AppButtonProps, "onPress">>(
					tree,
					(props) => typeof props.onPress === "function",
				).props.onPress();
				expect(navigation.navigate).toHaveBeenLastCalledWith(
					"InvestmentForm",
				);
			},
		);

		it.each([
			{
				kind: "SOURCE",
				Screen: SourcesScreen,
				load: "getSources",
				archive: "setSourceArchived",
				errorIndex: 4,
				searchIndex: 5,
			},
			{
				kind: "TRIP",
				Screen: TripsScreen,
				load: "getTrips",
				archive: "setTripArchived",
				errorIndex: 5,
				searchIndex: 6,
			},
			{
				kind: "INVESTMENT",
				Screen: InvestmentsScreen,
				load: "getInvestments",
				archive: "setInvestmentArchived",
				errorIndex: 5,
				searchIndex: 6,
			},
		] as const)(
			"handles $kind search, loading and archive failures",
			async ({
				kind,
				Screen,
				load,
				archive,
				errorIndex,
				searchIndex,
			}) => {
				const matching = { ...source, id: "match", name: "Keep" };
				const entities = [
					matching,
					{ ...source, id: "drop", name: "Drop" },
				];
				const setters = mockStateValues({
					1: entities,
					[errorIndex]: "visible error",
					[searchIndex]: true,
					[searchIndex + 1]: " keep ",
					[searchIndex + 2]: " keep ",
				});
				serviceMocks[load].mockRejectedValueOnce(
					new Error("load failed"),
				);
				serviceMocks[archive].mockRejectedValueOnce(
					new Error("archive failed"),
				);
				const navigation = {
					navigate: vi.fn(),
					setOptions: vi.fn<(options: HeaderOptions) => void>(),
				};
				const tree = (Screen as (props: unknown) => ReactElement)({
					navigation,
				});
				await flush();
				await flush();
				expect(setters.get(errorIndex)).toHaveBeenCalledWith(
					"load failed",
				);
				expect(setters.get(searchIndex + 2)).toHaveBeenCalledWith(
					" keep ",
				);
				expect(
					findElement<Pick<NoticeProps, "message">>(
						tree,
						(props) => props.message === "visible error",
					),
				).toBeDefined();

				const list = findElement<
					FinanceListProps<FinanceTestItem<typeof matching>>
				>(tree, (props) => Array.isArray(props.data)).props;
				const item: FinanceTestItem<typeof matching> =
					kind === "INVESTMENT"
						? { kind: "INVESTMENT", entity: matching }
						: matching;
				expect(list.data).toEqual([item]);
				const row = list.renderItem({ item });
				findElement<ActionProps>(
					row,
					(props) => props.accessibilityLabel === "Archive",
				).props.onPress();
				const confirmation = hookMocks.confirm.mock
					.calls[0]?.[0] as Pick<
					AppDialogConfirmOptions,
					"onConfirm"
				>;
				confirmation.onConfirm();
				await flush();
				expect(hookMocks.showMessage).toHaveBeenLastCalledWith({
					title: "Unable to archive",
					message: "archive failed",
					variant: "danger",
				});
				if (kind === "SOURCE") {
					serviceMocks.validateSource.mockRejectedValueOnce(
						new Error("validate failed"),
					);
					findElement<ActionProps>(
						row,
						(props) => props.accessibilityLabel === "Validate",
					).props.onPress();
					await flush();
					expect(hookMocks.showMessage).toHaveBeenLastCalledWith({
						title: "Unable to validate",
						message: "validate failed",
						variant: "danger",
					});
				}
				expect(hookMocks.refreshData).not.toHaveBeenCalled();
				const header =
					navigation.setOptions.mock.calls[0]?.[0].headerRight();
				findElement<HeaderIconButtonProps>(
					header,
					(props) => props.accessibilityLabel === "Close search",
				).props.onPress();
				const update = setters.get(searchIndex)?.mock.calls[0]?.[0] as (
					current: boolean,
				) => boolean;
				expect(update(true)).toBe(false);
				expect(update(false)).toBe(true);
				expect(setters.get(searchIndex + 1)).toHaveBeenCalledWith("");
				expect(setters.get(searchIndex + 2)).toHaveBeenLastCalledWith(
					"",
				);
			},
		);
	});

	describe("category list details", () => {
		const expense: Category = {
			id: "expense",
			name: "Food",
			isIncome: false,
			createdAt: 1,
			updatedAt: 1,
			archived: false,
		};
		const income: Category = {
			...expense,
			id: "income",
			name: "Salary",
			isIncome: true,
		};
		const empty: Category = { ...expense, id: "empty", name: "Unused" };
		const unpriced: Category = {
			...expense,
			id: "unpriced",
			name: "Travel",
		};
		const analysis = {
			categories: [
				{ categoryId: expense.id, currencyCode: "INR", net: "-10" },
				{ categoryId: expense.id, currencyCode: "USD", net: "-10" },
				{ categoryId: income.id, currencyCode: "INR", net: "10" },
				{ categoryId: unpriced.id, currencyCode: "ZZZ", net: "-100" },
			],
			missingCurrencies: ["ZZZ"],
		};
		const renderCategories = (navigation: unknown): ReactElement =>
			(CategoriesScreen as (props: unknown) => ReactElement)({
				navigation,
			});

		beforeEach(() => {
			vi.useFakeTimers();
			reactMocks.useLayoutEffect.mockImplementation((effect) => effect());
			reactMocks.useEffect.mockImplementation(
				(effect: () => () => void) => {
					const cleanup = effect();
					vi.runAllTimers();
					cleanup();
				},
			);
		});
		afterEach(() => {
			vi.useRealTimers();
		});

		it.each([true, false])(
			"renders sorted category totals with native currency=%s",
			async (nativeCurrency) => {
				mockStateValues({
					1: [income, expense, empty, unpriced],
					3: analysis,
					4: nativeCurrency,
					5: [{ currencyCode: "USD", rateToInr: "2" }],
				});
				const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
				const tree = renderCategories(navigation);
				await flush();
				const list = findElement<FinanceListProps<Category>>(
					tree,
					(props) => Array.isArray(props.data),
				).props;
				expect(list.data.map((category) => category.id)).toEqual([
					"expense",
					"empty",
					"unpriced",
					"income",
				]);
				for (const category of list.data) {
					expect(list.keyExtractor(category)).toBe(category.id);
					const row = list.renderItem({ item: category });
					row.props.onPress();
					expect(navigation.navigate).toHaveBeenLastCalledWith(
						"LinkedTransactions",
						{
							kind: "CATEGORY",
							entityId: category.id,
							entityName: category.name,
						},
					);
					const archive = findElement<ActionProps>(
						row,
						(props) => props.accessibilityLabel === "Archive",
					);
					expect(archive.props.style({ pressed: true })).not.toEqual(
						archive.props.style({ pressed: false }),
					);
					archive.props.onPress();
					const confirmation = hookMocks.confirm.mock.calls.at(
						-1,
					)?.[0] as Pick<AppDialogConfirmOptions, "onConfirm">;
					confirmation.onConfirm();
					await flush();
					expect(
						serviceMocks.setCategoryArchived,
					).toHaveBeenLastCalledWith({ id: "db" }, category.id, true);
				}
				expect(hookMocks.refreshData).toHaveBeenCalledTimes(4);
				findElement<Pick<AppButtonProps, "onPress">>(
					tree,
					(props) => typeof props.onPress === "function",
				).props.onPress();
				expect(navigation.navigate).toHaveBeenLastCalledWith(
					"CategoryForm",
				);
				expect(
					findElement<Pick<NoticeProps, "message">>(
						tree,
						(props) =>
							typeof props.message === "string" &&
							props.message.startsWith("Missing INR rates"),
					).props.message,
				).toContain("ZZZ");
			},
		);

		it.each(["INCOME", "EXPENSE", "ALL"])(
			"applies the %s classification and debounced search",
			async (filter) => {
				const setters = mockStateValues({
					1: [expense, income],
					2: filter,
					3: { categories: [], missingCurrencies: [] },
					6: "visible error",
					7: true,
					8: " food ",
					9: " food ",
				});
				const navigation = {
					navigate: vi.fn(),
					setOptions: vi.fn<(options: HeaderOptions) => void>(),
				};
				const tree = renderCategories(navigation);
				await flush();
				expect(serviceMocks.getCategories).toHaveBeenCalledWith(
					{ id: "db" },
					filter === "ALL" ? undefined : filter === "INCOME",
				);
				expect(setters.get(9)).toHaveBeenCalledWith(" food ");
				const list = findElement<FinanceListProps<Category>>(
					tree,
					(props) => Array.isArray(props.data),
				).props;
				expect(list.data).toEqual([expense]);
				expect(
					findElement<Pick<NoticeProps, "message">>(
						tree,
						(props) => props.message === "visible error",
					),
				).toBeDefined();
				const header =
					navigation.setOptions.mock.calls[0]?.[0].headerRight();
				findElement<HeaderIconButtonProps>(
					header,
					(props) => props.accessibilityLabel === "Close search",
				).props.onPress();
				const update = setters.get(7)?.mock.calls[0]?.[0] as (
					current: boolean,
				) => boolean;
				expect(update(true)).toBe(false);
				expect(update(false)).toBe(true);
				expect(setters.get(8)).toHaveBeenCalledWith("");
				expect(setters.get(9)).toHaveBeenLastCalledWith("");
			},
		);

		it("renders zero totals before analysis arrives and reports load and archive failures", async () => {
			const setters = mockStateValues({ 1: [expense, income] });
			serviceMocks.getCategories.mockRejectedValueOnce(
				new Error("categories failed"),
			);
			serviceMocks.setCategoryArchived.mockRejectedValueOnce(
				new Error("archive failed"),
			);
			const tree = renderCategories({
				navigate: vi.fn(),
				setOptions: vi.fn(),
			});
			await flush();
			await flush();
			expect(setters.get(6)).toHaveBeenCalledWith("categories failed");
			const list = findElement<FinanceListProps<Category>>(
				tree,
				(props) => Array.isArray(props.data),
			).props;
			const row = list.renderItem({ item: expense });
			expect(
				findElement<PropsWithChildren>(
					row,
					(props) => props.children === "INR 0",
				),
			).toBeDefined();
			findElement<ActionProps>(
				row,
				(props) => props.accessibilityLabel === "Archive",
			).props.onPress();
			const confirmation = hookMocks.confirm.mock.calls[0]?.[0] as Pick<
				AppDialogConfirmOptions,
				"onConfirm"
			>;
			confirmation.onConfirm();
			await flush();
			expect(hookMocks.showMessage).toHaveBeenCalledWith({
				title: "Unable to archive",
				message: "archive failed",
				variant: "danger",
			});
			expect(hookMocks.refreshData).not.toHaveBeenCalled();
		});
	});

	it.each([
		{ name: "Categories", Screen: CategoriesScreen, currencyStateIndex: 4 },
		{
			name: "Investments",
			Screen: InvestmentsScreen,
			currencyStateIndex: 3,
		},
		{ name: "Sources", Screen: SourcesScreen, currencyStateIndex: 2 },
		{ name: "Trips", Screen: TripsScreen, currencyStateIndex: 3 },
	])(
		"$name reads currency changes from Settings and keeps header search",
		async ({ Screen, currencyStateIndex }) => {
			const navigation = {
				navigate: vi.fn(),
				setOptions: vi.fn<(options: HeaderOptions) => void>(),
			};
			const setNativeCurrency = vi.fn();
			let stateCall = 0;
			reactMocks.useState.mockImplementation((initial: unknown) => {
				stateCall += 1;
				return [
					typeof initial === "function"
						? (initial as () => unknown)()
						: initial,
					stateCall === currencyStateIndex
						? setNativeCurrency
						: vi.fn(),
				];
			});

			const renderScreen = Screen as (props: unknown) => ReactElement;
			renderScreen({ navigation });
			await flush();
			expect(setNativeCurrency).toHaveBeenLastCalledWith(true);

			serviceMocks.getNativeCurrencyDisplay.mockResolvedValue(false);
			navigationMocks.useFocusEffect.mock.calls[0]?.[0]();
			await flush();
			expect(serviceMocks.getNativeCurrencyDisplay).toHaveBeenCalledWith({
				id: "db",
			});
			expect(serviceMocks.getNativeCurrencyDisplay).toHaveBeenCalledTimes(
				2,
			);
			expect(setNativeCurrency).toHaveBeenLastCalledWith(false);

			reactMocks.useLayoutEffect.mock.calls.forEach(([effect]) =>
				effect(),
			);
			const header =
				navigation.setOptions.mock.calls[0]?.[0].headerRight();
			const searchButton = findElement<HeaderIconButtonProps>(
				header,
				(props) => props.accessibilityLabel === "Search",
			);
			expect(searchButton.props.icon).toBe("search-outline");
			searchButton.props.onPress();
			expect(
				serviceMocks.updateNativeCurrencyDisplay,
			).not.toHaveBeenCalled();
		},
	);

	it("opens Budgets from the Categories header", async () => {
		const navigation = {
			navigate: vi.fn(),
			setOptions: vi.fn<(options: HeaderOptions) => void>(),
		};
		const renderScreen = CategoriesScreen as (
			props: unknown,
		) => ReactElement;
		renderScreen({ navigation });
		await flush();
		reactMocks.useLayoutEffect.mock.calls.forEach(([effect]) => effect());
		const header = navigation.setOptions.mock.calls[0]?.[0].headerRight();
		const budgetsButton = findElement<HeaderIconButtonProps>(
			header,
			(props) => props.accessibilityLabel === "Budgets",
		);

		expect(budgetsButton.props.icon).toBe("speedometer-outline");
		budgetsButton.props.onPress();
		expect(navigation.navigate).toHaveBeenCalledWith("Budgets");
	});

	it.each([
		{
			filter: "ALL",
			search: "",
			expectedNames: [
				"Cash",
				"Old Bank",
				"Bank",
				"Wallet",
				"Empty Account",
			],
		},
		{
			filter: "VALIDATED",
			search: "",
			expectedNames: ["Bank", "Wallet", "Empty Account"],
		},
		{
			filter: "PENDING_VALIDATION",
			search: "",
			expectedNames: ["Cash", "Old Bank"],
		},
		{
			filter: "ALL",
			search: " bAnK ",
			expectedNames: ["Old Bank", "Bank"],
		},
		{ filter: "VALIDATED", search: " bAnK ", expectedNames: ["Bank"] },
		{
			filter: "PENDING_VALIDATION",
			search: " bAnK ",
			expectedNames: ["Old Bank"],
		},
		{ filter: "VALIDATED", search: "missing", expectedNames: [] },
		{ filter: "PENDING_VALIDATION", search: "missing", expectedNames: [] },
	])(
		"filters Sources by $filter and search '$search' while preserving balance order",
		async ({ filter, search, expectedNames }) => {
			const sources: readonly Source[] = [
				{
					name: "Wallet",
					balance: "30",
					validatedAt: 300,
					latestTransactionCreatedAt: 200,
				},
				{
					name: "Cash",
					balance: "0",
					validatedAt: null,
					latestTransactionCreatedAt: null,
				},
				{
					name: "Empty Account",
					balance: "40",
					validatedAt: 0,
					latestTransactionCreatedAt: null,
				},
				{
					name: "Old Bank",
					balance: "10",
					validatedAt: 100,
					latestTransactionCreatedAt: 200,
				},
				{
					name: "Bank",
					balance: "20",
					validatedAt: 200,
					latestTransactionCreatedAt: 200,
				},
			].map((source, index) => ({
				...source,
				id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
				currencyCode: "INR",
				createdAt: 0,
				updatedAt: 0,
				archived: false,
			}));
			const setSourceFilter = vi.fn();
			let stateCall = 0;
			reactMocks.useState.mockImplementation((initial: unknown) => {
				stateCall += 1;
				if (stateCall === 1) return [sources, vi.fn()];
				if (stateCall === 7) return [search, vi.fn()];
				if (stateCall === 8) return [filter, setSourceFilter];
				return [initial, vi.fn()];
			});
			const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
			const renderScreen = SourcesScreen as (
				props: unknown,
			) => ReactElement;
			const tree = renderScreen({ navigation });
			await flush();
			const list = findElement<SourceListTestProps>(
				tree,
				(props) => typeof props.renderItem === "function",
			);
			expect(list.props.data.map((source) => source.name)).toEqual(
				expectedNames,
			);
			const control = findElement<SegmentedControlProps>(
				list.props.ListHeaderComponent,
				(props) => Array.isArray(props.options),
			);
			expect(control.props.value).toBe(filter);
			expect(control.props.labelNumberOfLines).toBe(2);
			expect(control.props.options).toEqual([
				{ label: "All", value: "ALL" },
				{ label: "Validated", value: "VALIDATED" },
				{ label: "Pending", value: "PENDING_VALIDATION" },
			]);
			for (const option of control.props.options) {
				control.props.onChange(option.value);
				expect(setSourceFilter).toHaveBeenLastCalledWith(option.value);
			}
			for (const source of list.props.data) {
				const row = list.props.renderItem({ item: source });
				const card = findElement<Pick<GlassCardProps, "accent">>(
					row,
					(props) => typeof props.accent === "string",
				);
				expect(card.props.accent).toBe(
					["Bank", "Wallet", "Empty Account"].includes(source.name)
						? "success"
						: "default",
				);
			}
			expect(list.props.ListEmptyComponent.props.title).toBe(
				filter !== "ALL" || search.trim()
					? "No matching sources"
					: "No sources yet",
			);
		},
	);

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
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ExchangeRatesScreen({} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Fetch latest rates" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({ item: "USD" });
		findByPredicate(
			row,
			(node) =>
				node?.props?.label === "Save manual rate" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.fetchExchangeRates).toHaveBeenCalledWith({
			id: "db",
		});
		expect(serviceMocks.saveManualExchangeRate).toHaveBeenCalledWith(
			{ id: "db" },
			"USD",
			"84",
		);
		expect(hookMocks.refreshData).toHaveBeenCalled();
	});

	it("covers ExchangeRatesScreen no-count fetch and missing-rate save branch", async () => {
		serviceMocks.fetchExchangeRates.mockResolvedValue(0);
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [["EUR"], vi.fn()];
			if (call === 2) return [[], vi.fn()];
			if (call === 3) return [{}, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ExchangeRatesScreen({} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Fetch latest rates" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({ item: "EUR" });
		findByPredicate(
			row,
			(node) =>
				node?.props?.label === "Save manual rate" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.saveManualExchangeRate).toHaveBeenCalledWith(
			{ id: "db" },
			"EUR",
			"",
		);
	});

	it("covers ExchangeRatesScreen singular fetch message and message notice", async () => {
		serviceMocks.fetchExchangeRates.mockResolvedValue(1);

		const setMessage = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [["USD"], vi.fn()];
			if (call === 2) return [[], vi.fn()];
			if (call === 3) return [{ USD: "" }, vi.fn()];
			if (call === 6) return ["Updated 1 exchange rate.", setMessage];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ExchangeRatesScreen({} as any);
		await flush();

		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.message === "Updated 1 exchange rate.",
			),
		).not.toHaveLength(0);

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Fetch latest rates" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(setMessage).toHaveBeenCalledWith("Updated 1 exchange rate.");
	});

	it("renders ExchangeRatesScreen error and unset-rate branches", async () => {
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [["EUR"], vi.fn()];
			if (call === 2) return [[], vi.fn()];
			if (call === 3) return [{ EUR: "" }, vi.fn()];
			if (call === 5) return ["boom", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ExchangeRatesScreen({} as any);
		await flush();

		expect(
			findByPredicate(tree, (node) => node?.props?.message === "boom"),
		).not.toHaveLength(0);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({ item: "EUR" });
		expect(
			findByPredicate(row, (node) =>
				String(node?.props?.children ?? "").includes("Rate not set"),
			),
		).not.toHaveLength(0);
	});

	it("covers ExchangeRatesScreen load, fetch, save error and updater callbacks", async () => {
		serviceMocks.getSources.mockRejectedValueOnce(new Error("load failed"));
		serviceMocks.fetchExchangeRates.mockRejectedValueOnce(
			new Error("fetch failed"),
		);
		serviceMocks.saveManualExchangeRate.mockRejectedValueOnce(
			new Error("save failed"),
		);

		const setDrafts = vi.fn();
		const setError = vi.fn();
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
			if (call === 3) return [{ USD: "84" }, setDrafts];
			if (call === 5) return ["", setError];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ExchangeRatesScreen({} as any);
		await flush();

		expect(setError).toHaveBeenCalledWith("load failed");

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Fetch latest rates" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		expect(setError).toHaveBeenCalledWith("fetch failed");

		const screenList = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.renderItem === "function" &&
				typeof node?.props?.keyExtractor === "function",
		)[0];
		expect(screenList.props.keyExtractor("USD")).toBe("USD");

		const row = screenList.props.renderItem({ item: "USD" });
		const textField = findByPredicate(
			row,
			(node) =>
				node?.props?.label === "Rate to INR" &&
				typeof node?.props?.onChangeText === "function",
		)[0];
		textField.props.onChangeText("99.10");
		expect(setDrafts).toHaveBeenCalled();
		const draftsUpdater = setDrafts.mock.calls.at(-1)?.[0] as (
			currentDrafts: Record<string, string>,
		) => Record<string, string>;
		expect(draftsUpdater({ USD: "84", EUR: "91" })).toEqual({
			USD: "99.10",
			EUR: "91",
		});

		findByPredicate(
			row,
			(node) =>
				node?.props?.label === "Save manual rate" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.saveManualExchangeRate).toHaveBeenCalledWith(
			{ id: "db" },
			"USD",
			"84",
		);
		expect(setError).toHaveBeenCalledWith("save failed");
	});

	it("executes ArchivedRelationsScreen list and restore flow", async () => {
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[{ id: "s1", name: "Cash" }], vi.fn()];
			if (call === 2) return [[{ id: "c1", name: "Food" }], vi.fn()];
			if (call === 3) return [[{ id: "t1", name: "Goa" }], vi.fn()];
			if (call === 4) return [[{ id: "i1", name: "MF" }], vi.fn()];
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
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const entityRow = screenList.props.data.find(
			(row: any) => row.type === "entity",
		);
		const rendered = screenList.props.renderItem({ item: entityRow });
		findByPredicate(
			rendered,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.getArchivedSources).toHaveBeenCalledWith({
			id: "db",
		});
		expect(serviceMocks.getArchivedCategories).toHaveBeenCalledWith({
			id: "db",
		});
		expect(serviceMocks.getArchivedTrips).toHaveBeenCalledWith({
			id: "db",
		});
		expect(serviceMocks.getArchivedInvestments).toHaveBeenCalledWith({
			id: "db",
		});
		expect(serviceMocks.setSourceArchived).toHaveBeenCalledWith(
			{ id: "db" },
			"s1",
			false,
		);
		expect(hookMocks.refreshData).toHaveBeenCalled();
	});

	it("covers ArchivedRelationsScreen search-empty message and investment restore branch", async () => {
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[], vi.fn()];
			if (call === 2) return [[], vi.fn()];
			if (call === 3) return [[], vi.fn()];
			if (call === 4) return [[{ id: "i1", name: "MF" }], vi.fn()];
			if (call === 6) return ["mf", vi.fn()];
			if (call === 7) return ["mf", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ArchivedRelationsScreen({} as any);
		await flush();

		expect(
			findByPredicate(
				tree,
				(node) =>
					node?.props?.placeholder === "Search archived relations...",
			),
		).not.toHaveLength(0);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const entityRow = screenList.props.data.find(
			(row: any) => row.kind === "INVESTMENT",
		);
		const rendered = screenList.props.renderItem({ item: entityRow });
		findByPredicate(
			rendered,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.setInvestmentArchived).toHaveBeenCalledWith(
			{ id: "db" },
			"i1",
			false,
		);
	});

	it("renders ArchivedRelationsScreen header row and error branch", async () => {
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[{ id: "s1", name: "Cash" }], vi.fn()];
			if (call === 2) return [[], vi.fn()];
			if (call === 3) return [[], vi.fn()];
			if (call === 4) return [[], vi.fn()];
			if (call === 5) return ["broken", vi.fn()];
			if (call === 6) return ["", vi.fn()];
			if (call === 7) return ["", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ArchivedRelationsScreen({} as any);
		await flush();

		expect(
			findByPredicate(tree, (node) => node?.props?.message === "broken"),
		).not.toHaveLength(0);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const headerRow = screenList.props.data.find(
			(row: any) => row.type === "header",
		);
		const rendered = screenList.props.renderItem({ item: headerRow });
		expect(String(JSON.stringify(rendered) ?? "")).toContain(
			"SOURCE TITLE",
		);
	});

	it("covers ArchivedRelationsScreen load-error catch path", async () => {
		serviceMocks.getArchivedSources.mockRejectedValueOnce(
			new Error("cannot load archived"),
		);
		const setError = vi.fn();

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 5) return ["", setError];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		ArchivedRelationsScreen({} as any);
		await flush();

		expect(setError).toHaveBeenCalledWith("cannot load archived");
	});

	it("covers ArchivedRelationsScreen category and trip restore branches", async () => {
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);
		serviceMocks.setCategoryArchived.mockRejectedValueOnce(
			new Error("cannot restore category"),
		);

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
		expect(hookMocks.showMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Unable to restore",
				message: "cannot restore category",
				variant: "danger",
			}),
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

	it.each([
		["SOURCE", "deleteSource"],
		["CATEGORY", "deleteCategory"],
		["TRIP", "deleteTrip"],
		["INVESTMENT", "deleteInvestment"],
	] as const)(
		"executes LinkedTransactionsScreen delete flow for %s",
		async (kind, deleteKey) => {
			const navigation = { navigate: vi.fn(), goBack: vi.fn() };
			hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
				onConfirm(),
			);

			let call = 0;
			reactMocks.useState.mockImplementation((initial: any) => {
				call += 1;
				if (call === 1) {
					return [[{ id: "tx1", transactionAt: 100 }], vi.fn()];
				}
				return [
					typeof initial === "function" ? initial() : initial,
					vi.fn(),
				];
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
				(node) =>
					node?.props?.label === "Delete" &&
					typeof node?.props?.onPress === "function",
			)[0]?.props?.onPress();
			await flush();

			expect(serviceMocks.getLinkedTransactions).toHaveBeenCalledWith(
				{ id: "db" },
				{ entityId: "e1", kind },
			);
			expect(serviceMocks[deleteKey]).toHaveBeenCalledWith(
				{ id: "db" },
				"e1",
			);
			expect(hookMocks.refreshData).toHaveBeenCalled();
			expect(navigation.goBack).toHaveBeenCalled();
		},
	);

	it("covers LinkedTransactionsScreen edit and transaction navigation callbacks", async () => {
		const navigation = { navigate: vi.fn(), goBack: vi.fn() };

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) {
				return [[{ id: "tx1", transactionAt: 100 }], vi.fn()];
			}
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

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

		expect(navigation.navigate).toHaveBeenCalledWith("CategoryForm", {
			entityId: "e1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("TransactionForm", {
			transactionId: "tx9",
		});
	});

	it("covers LinkedTransactionsScreen load-error and delete-error branches", async () => {
		const navigation = { navigate: vi.fn(), goBack: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);
		serviceMocks.getLinkedTransactions.mockRejectedValueOnce(
			new Error("load failed"),
		);
		serviceMocks.deleteSource.mockRejectedValueOnce(
			new Error("cannot delete"),
		);

		const tree = LinkedTransactionsScreen({
			navigation,
			route: {
				key: "k",
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

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Delete" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.getLinkedTransactions).toHaveBeenCalledWith(
			{ id: "db" },
			{ entityId: "e1", kind: "SOURCE" },
		);
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

	it("executes BudgetsScreen render and delete flows", async () => {
		const navigation = { navigate: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);

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
								credits: "10",
								debits: "100",
							},
						],
					},
					vi.fn(),
				];
			}
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = BudgetsScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
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
			(node) =>
				node?.props?.label === "Edit" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		findByPredicate(
			renderedItem,
			(node) =>
				node?.props?.label === "Delete" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.getBudgets).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getAnalysisSummary).toHaveBeenCalledTimes(2);
		expect(serviceMocks.deleteBudget).toHaveBeenCalledWith(
			{ id: "db" },
			"b1",
		);
		expect(hookMocks.refreshData).toHaveBeenCalled();
		expect(navigation.navigate).toHaveBeenCalled();
	});

	it("covers BudgetsScreen load error, yearly rendering, key extractor and add action", async () => {
		const navigation = { navigate: vi.fn() };
		serviceMocks.getBudgets.mockRejectedValueOnce(new Error("load failed"));

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) {
				return [
					[
						{
							id: "b2",
							categoryId: "c2",
							categoryName: "Rent",
							amount: "100",
							period: "YEARLY",
						},
					],
					vi.fn(),
				];
			}
			if (call === 2 || call === 3) return [undefined, vi.fn()];
			if (call === 4) return ["load failed", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = BudgetsScreen({ navigation } as any);
		await flush();

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
		expect(screenList.props.keyExtractor({ id: "b2" })).toBe("b2");

		const renderedItem = screenList.props.renderItem({
			item: {
				id: "b2",
				categoryId: "c2",
				categoryName: "Rent",
				amount: "100",
				period: "YEARLY",
			},
		});

		expect(String(JSON.stringify(renderedItem) ?? "")).toContain(
			"Calendar year",
		);
		expect(
			findByPredicate(
				renderedItem,
				(node) => node?.props?.accent === "default",
			),
		).not.toHaveLength(0);

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => {
			node.props.onPress();
		});
		expect(navigation.navigate).toHaveBeenCalledWith("BudgetForm");
	});

	it("covers BudgetsScreen delete failure and non-INR budget rows", async () => {
		const navigation = { navigate: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);
		serviceMocks.deleteBudget.mockRejectedValueOnce(
			new Error("cannot delete"),
		);

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) {
				return [
					[
						{
							id: "b3",
							categoryId: "c3",
							categoryName: "Travel",
							amount: "50",
							period: "MONTHLY",
						},
					],
					vi.fn(),
				];
			}
			if (call === 2) {
				return [
					{
						categories: [
							{
								categoryId: "c3",
								currencyCode: "USD",
								credits: "200",
								debits: "0",
							},
						],
					},
					vi.fn(),
				];
			}
			if (call === 3) return [null, vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = BudgetsScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const renderedItem = screenList.props.renderItem({
			item: {
				id: "b3",
				categoryId: "c3",
				categoryName: "Travel",
				amount: "50",
				period: "MONTHLY",
			},
		});

		findByPredicate(
			renderedItem,
			(node) =>
				node?.props?.label === "Delete" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.deleteBudget).toHaveBeenCalledWith(
			{ id: "db" },
			"b3",
		);
		expect(hookMocks.showMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Unable to delete",
				message: "cannot delete",
				variant: "danger",
			}),
		);
	});

	it("executes NotesScreen render and folder actions", async () => {
		const navigation = { navigate: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);

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
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = NotesScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
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

		const folderChips = findByPredicate(
			tree,
			(node) => typeof node?.props?.onDeleteFolder === "function",
		)[0];
		folderChips.props.onDeleteFolder({ id: "f1", name: "Home" });
		folderChips.props.onRenameFolder({ id: "f1", name: "Home" }, "Work");
		await flush();

		expect(serviceMocks.getNotes).toHaveBeenCalledWith({ id: "db" });
		expect(hookMocks.handleDeleteFolder).toHaveBeenCalledWith("f1");
		expect(hookMocks.handleRenameFolder).toHaveBeenCalledWith("f1", "Work");
	});

	it("covers NotesScreen folder filters, quick chips, key extraction, and add navigation", async () => {
		const navigation = { navigate: vi.fn() };
		folderState.folders = [
			{ id: "f1", name: "Home" },
			{ id: "f2", name: "Work" },
		];

		const setSelectedFolderId = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) {
				return [
					[
						{
							id: "n0",
							title: "Loose",
							content: "",
							folderId: "",
							folderName: "",
							hasAttachment: false,
							updatedAt: 100,
						},
						{
							id: "n1",
							title: "Home note",
							content: "Body",
							folderId: "f1",
							folderName: "Home",
							hasAttachment: true,
							updatedAt: 101,
						},
						{
							id: "n2",
							title: "Work note",
							content: "Body",
							folderId: "f2",
							folderName: "Work",
							hasAttachment: true,
							updatedAt: 102,
						},
					],
					vi.fn(),
				];
			}
			if (call === 2) return ["__NO_FOLDER__", setSelectedFolderId];
			if (call === 3) return ["", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = NotesScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		expect(screenList.props.data).toHaveLength(1);
		expect(screenList.props.data[0].id).toBe("n0");
		expect(screenList.props.keyExtractor({ id: "n0" })).toBe("n0");

		const renderedItem = screenList.props.renderItem({
			item: screenList.props.data[0],
		});
		expect(String(JSON.stringify(renderedItem) ?? "")).toContain(
			"Empty note",
		);
		findByPredicate(
			renderedItem,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((node) => {
			node.props.onPress();
		});

		expect(setSelectedFolderId).toHaveBeenCalledWith("f1");
		expect(navigation.navigate).toHaveBeenCalledWith("NoteForm", {
			noteId: "n0",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("NoteForm");
	});

	it("covers NotesScreen delete and rename folder error branches", async () => {
		const navigation = { navigate: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);
		serviceMocks.getNotes.mockRejectedValueOnce(new Error("notes failed"));
		hookMocks.handleDeleteFolder
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(new Error("cannot delete folder"));
		hookMocks.handleRenameFolder.mockRejectedValueOnce(
			new Error("cannot rename folder"),
		);

		const setSelectedFolderId = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[{ id: "n1" }], vi.fn()];
			if (call === 2) return ["f1", setSelectedFolderId];
			if (call === 3) return ["notes failed", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = NotesScreen({ navigation } as any);
		await flush();

		const folderChips = findByPredicate(
			tree,
			(node) => typeof node?.props?.onDeleteFolder === "function",
		)[0];
		folderChips.props.onDeleteFolder({ id: "f1", name: "Home" });
		folderChips.props.onDeleteFolder({ id: "f1", name: "Home" });
		folderChips.props.onRenameFolder({ id: "f1", name: "Home" }, "Work");
		await flush();

		expect(hookMocks.handleDeleteFolder).toHaveBeenCalledTimes(2);
		expect(setSelectedFolderId).toHaveBeenCalledWith("__ALL_FOLDERS__");
		expect(hookMocks.handleRenameFolder).toHaveBeenCalledWith("f1", "Work");
		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.message === "notes failed",
			),
		).not.toHaveLength(0);
	});

	it("covers NotesScreen no-quick-chip branch with empty note counts", async () => {
		const navigation = { navigate: vi.fn() };
		folderState.folders = [];

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[], vi.fn()];
			if (call === 2) return ["__ALL_FOLDERS__", vi.fn()];
			if (call === 3) return ["", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = NotesScreen({ navigation } as any);
		await flush();
		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const header = screenList?.props?.ListHeaderComponent;

		const folderChips = findByPredicate(
			tree,
			(node) => typeof node?.props?.onSelectFolder === "function",
		)[0];
		folderChips?.props?.onSelectFolder("f2");

		expect(
			findByPredicate(header, (node) => node?.props?.horizontal === true),
		).toHaveLength(0);
	});

	it("renders quick chips when notes exist inside folders", async () => {
		const navigation = { navigate: vi.fn() };
		folderState.folders = [
			{ id: "f1", name: "Home" },
			{ id: "f2", name: "Work" },
		];

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) {
				return [
					[
						{
							id: "n1",
							title: "Home note",
							content: "Body",
							folderId: "f1",
							folderName: "Home",
							hasAttachment: false,
							updatedAt: 101,
						},
					],
					vi.fn(),
				];
			}
			if (call === 2) return ["__ALL_FOLDERS__", vi.fn()];
			if (call === 3) return ["", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = NotesScreen({ navigation } as any);
		await flush();
		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const header = screenList?.props?.ListHeaderComponent;

		expect(
			findByPredicate(
				header,
				(node) =>
					node?.props?.horizontal === true &&
					node?.props?.style?.marginTop === 6,
			),
		).toHaveLength(1);
	});

	it("covers quick-chip sort fallback when folder counts are missing", async () => {
		const navigation = { navigate: vi.fn() };
		folderState.folders = [
			{ id: "f1", name: "Home" },
			{ id: "f2", name: "Work" },
			{ id: "f3", name: "Travel" },
		];

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[], vi.fn()];
			if (call === 2) return ["__ALL_FOLDERS__", vi.fn()];
			if (call === 3) return ["", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = NotesScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const header = screenList?.props?.ListHeaderComponent;

		expect(
			findByPredicate(header, (node) => node?.props?.horizontal === true),
		).toHaveLength(1);
	});

	it("executes TodosScreen render toggle and folder actions", async () => {
		const navigation = { navigate: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);

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
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TodosScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
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

		const folderChips = findByPredicate(
			tree,
			(node) => typeof node?.props?.onDeleteFolder === "function",
		)[0];
		folderChips.props.onDeleteFolder({ id: "f1", name: "Home" });
		folderChips.props.onRenameFolder({ id: "f1", name: "Home" }, "Work");
		await flush();

		expect(serviceMocks.getTodos).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.toggleTodo).toHaveBeenCalledWith(
			{ id: "db" },
			"t1",
		);
		expect(hookMocks.refreshData).toHaveBeenCalled();
		expect(hookMocks.handleDeleteFolder).toHaveBeenCalledWith("f1");
		expect(hookMocks.handleRenameFolder).toHaveBeenCalledWith("f1", "Work");
	});

	it("covers TodosScreen no-folder filter, quick chips, key extraction, and add navigation", async () => {
		const navigation = { navigate: vi.fn() };
		folderState.folders = [
			{ id: "f1", name: "Home" },
			{ id: "f2", name: "Work" },
		];
		serviceMocks.toggleTodo.mockRejectedValueOnce(
			new Error("toggle failed"),
		);

		const setSelectedFolderId = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) {
				return [
					[
						{
							id: "t0",
							title: "Loose",
							description: "",
							folderId: "",
							folderName: null,
							hasAttachment: false,
							isDone: true,
							dueAt: null,
						},
						{
							id: "t1",
							title: "Home",
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
			if (call === 2) return ["__NO_FOLDER__", setSelectedFolderId];
			if (call === 3) return ["", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TodosScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		expect(screenList.props.data).toHaveLength(1);
		expect(screenList.props.data[0].id).toBe("t0");
		expect(screenList.props.keyExtractor({ id: "t0" })).toBe("t0");

		const renderedItem = screenList.props.renderItem({
			item: screenList.props.data[0],
		});
		findByPredicate(
			renderedItem,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((pressable) => {
			pressable.props.onPress();
		});
		await flush();

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((pressable) => {
			pressable.props.onPress();
		});

		expect(serviceMocks.toggleTodo).toHaveBeenCalledWith(
			{ id: "db" },
			"t0",
		);
		expect(setSelectedFolderId).toHaveBeenCalledWith("f1");
		expect(navigation.navigate).toHaveBeenCalledWith("TodoForm", {
			todoId: "t0",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("TodoForm");
	});

	it("covers TodosScreen load, delete, and rename folder error paths", async () => {
		const navigation = { navigate: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);
		serviceMocks.getTodos.mockRejectedValueOnce(new Error("todos failed"));
		hookMocks.handleDeleteFolder
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(new Error("cannot delete folder"));
		hookMocks.handleRenameFolder.mockRejectedValueOnce(
			new Error("cannot rename folder"),
		);

		const setSelectedFolderId = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[{ id: "t1" }], vi.fn()];
			if (call === 2) return ["f1", setSelectedFolderId];
			if (call === 3) return ["todos failed", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TodosScreen({ navigation } as any);
		await flush();

		const folderChips = findByPredicate(
			tree,
			(node) => typeof node?.props?.onDeleteFolder === "function",
		)[0];
		folderChips.props.onDeleteFolder({ id: "f1", name: "Home" });
		folderChips.props.onDeleteFolder({ id: "f1", name: "Home" });
		folderChips.props.onRenameFolder({ id: "f1", name: "Home" }, "Work");
		await flush();

		expect(hookMocks.handleDeleteFolder).toHaveBeenCalledTimes(2);
		expect(setSelectedFolderId).toHaveBeenCalledWith("__ALL_FOLDERS__");
		expect(hookMocks.handleRenameFolder).toHaveBeenCalledWith("f1", "Work");
		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.message === "todos failed",
			),
		).not.toHaveLength(0);
	});

	it("covers TodosScreen quick-chip fallback and hidden-row branches", async () => {
		const navigation = { navigate: vi.fn() };
		folderState.folders = [
			{ id: "f1", name: "Home" },
			{ id: "f2", name: "Work" },
		];

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[], vi.fn()];
			if (call === 2) return ["__ALL_FOLDERS__", vi.fn()];
			if (call === 3) return ["", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TodosScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const header = screenList?.props?.ListHeaderComponent;
		expect(
			findByPredicate(header, (node) => node?.props?.horizontal === true),
		).toHaveLength(1);

		folderState.folders = [];
		call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[], vi.fn()];
			if (call === 2) return ["__ALL_FOLDERS__", vi.fn()];
			if (call === 3) return ["", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const noChipTree = TodosScreen({ navigation } as any);
		await flush();
		const noChipList = findByPredicate(
			noChipTree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const noChipHeader = noChipList?.props?.ListHeaderComponent;
		expect(
			findByPredicate(
				noChipHeader,
				(node) => node?.props?.horizontal === true,
			),
		).toHaveLength(0);
	});
});
