import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getBudgets: vi.fn(),
	getCards: vi.fn(),
	getCategories: vi.fn(),
	getExchangeRates: vi.fn(),
	getIdentities: vi.fn(),
	getInvestments: vi.fn(),
	getNotes: vi.fn(),
	getPasswords: vi.fn(),
	getSources: vi.fn(),
	getTodos: vi.fn(),
	getTransactions: vi.fn(),
	getTransactionDisplayReason: vi.fn(),
	getTrips: vi.fn(),
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
vi.mock("@/components/TextField", () => ({
	default: (props: any) => ({ type: "TextField", props }),
}));

vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({ database: { id: "db" }, dataVersion: 1 }),
}));

vi.mock("@/services/budgetService", () => ({
	default: { getBudgets: serviceMocks.getBudgets },
}));
vi.mock("@/services/cardService", () => ({
	default: { getCards: serviceMocks.getCards },
}));
vi.mock("@/services/categoryService", () => ({
	default: { getCategories: serviceMocks.getCategories },
}));
vi.mock("@/services/exchangeRateService", () => ({
	default: { getExchangeRates: serviceMocks.getExchangeRates },
}));
vi.mock("@/services/identityService", () => ({
	default: { getIdentities: serviceMocks.getIdentities },
}));
vi.mock("@/services/investmentService", () => ({
	default: { getInvestments: serviceMocks.getInvestments },
}));
vi.mock("@/services/noteService", () => ({
	default: { getNotes: serviceMocks.getNotes },
}));
vi.mock("@/services/passwordService", () => ({
	default: { getPasswords: serviceMocks.getPasswords },
}));
vi.mock("@/services/sourceService", () => ({
	default: { getSources: serviceMocks.getSources },
}));
vi.mock("@/services/todoService", () => ({
	default: { getTodos: serviceMocks.getTodos },
}));
vi.mock("@/services/transactionService", () => ({
	default: {
		getTransactionDisplayReason: serviceMocks.getTransactionDisplayReason,
		getTransactions: serviceMocks.getTransactions,
	},
}));
vi.mock("@/services/tripService", () => ({
	default: { getTrips: serviceMocks.getTrips },
}));

vi.mock("@/utils/date", () => ({
	default: {
		formatDate: (value: number) => `date:${value}`,
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

import GlobalSearchScreen from "@/screens/GlobalSearchScreen";

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

describe("GlobalSearchScreen", () => {
	beforeEach(() => {
		vi.spyOn(globalThis, "setTimeout").mockImplementation(((fn: any) => {
			fn();
			return 0;
		}) as any);
		vi.spyOn(globalThis, "clearTimeout").mockImplementation(() => {});

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
		serviceMocks.getTransactionDisplayReason.mockImplementation(
			(transaction: any) => transaction.reason || "Reason",
		);

		serviceMocks.getNotes.mockResolvedValue([
			{ id: "n1", title: "Note", folderName: "Home" },
		]);
		serviceMocks.getTodos.mockResolvedValue([
			{ id: "t1", title: "Todo", folderName: "Home" },
		]);

		serviceMocks.getTransactions.mockResolvedValue([
			{
				id: "tx1",
				reason: "Lunch",
				sourceName: "Cash",
				amount: "100",
				sourceCurrencyCode: "INR",
				transactionAt: 10,
				categoryName: "Food",
				tripName: "Goa",
				investmentName: "MF",
				destinationSourceName: "Card",
			},
		]);
		serviceMocks.getSources.mockResolvedValue([
			{ id: "s1", name: "Cash", currencyCode: "INR" },
		]);
		serviceMocks.getCategories.mockResolvedValue([
			{ id: "c1", name: "Food", isIncome: false },
		]);
		serviceMocks.getTrips.mockResolvedValue([{ id: "tr1", name: "Goa" }]);
		serviceMocks.getInvestments.mockResolvedValue([
			{ id: "i1", name: "MF" },
		]);
		serviceMocks.getBudgets.mockResolvedValue([
			{
				id: "b1",
				categoryName: "Food",
				period: "MONTHLY",
				amount: "500",
			},
		]);
		serviceMocks.getExchangeRates.mockResolvedValue([
			{ currencyCode: "USD", rateToInr: "83", source: "manual" },
		]);

		serviceMocks.getPasswords.mockResolvedValue([
			{ id: "p1", title: "Github", username: "u", website: "" },
		]);
		serviceMocks.getCards.mockResolvedValue([
			{ id: "ca1", name: "Visa", network: "VISA" },
		]);
		serviceMocks.getIdentities.mockResolvedValue([
			{ id: "id1", title: "Passport", idNumber: "P1" },
		]);
	});

	it("loads TOOLS mode and opens NOTE and TODO results", async () => {
		const navigation = { navigate: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [[], vi.fn()];
			}
			if (stateCall === 2) return ["ho", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = GlobalSearchScreen({
			navigation,
			route: {
				key: "k",
				name: "GlobalSearch",
				params: { mode: "TOOLS" },
			},
		} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const noteRow = screenList.props.renderItem({
			item: {
				id: "n1",
				kind: "NOTE",
				title: "Note",
				subtitle: "Home",
				icon: "document-text-outline",
				color: "#00f",
			},
		});
		findByPredicate(
			noteRow,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		const todoRow = screenList.props.renderItem({
			item: {
				id: "t1",
				kind: "TODO",
				title: "Todo",
				subtitle: "Home",
				icon: "checkbox-outline",
				color: "#0f0",
			},
		});
		findByPredicate(
			todoRow,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();

		expect(serviceMocks.getNotes).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getTodos).toHaveBeenCalledWith({ id: "db" });
		expect(navigation.navigate).toHaveBeenCalledWith("NoteForm", {
			noteId: "n1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("TodoForm", {
			todoId: "t1",
		});
	});

	it("loads FINANCE mode and opens all finance result kinds", async () => {
		const navigation = { navigate: vi.fn() };
		const financeResults = [
			{
				id: "tx1",
				kind: "TRANSACTION",
				title: "Lunch",
				subtitle: "Cash",
				icon: "swap-horizontal",
				color: "#1",
			},
			{
				id: "s1",
				kind: "SOURCE",
				title: "Cash",
				subtitle: "Source",
				icon: "wallet-outline",
				color: "#2",
			},
			{
				id: "c1",
				kind: "CATEGORY",
				title: "Food",
				subtitle: "Category",
				icon: "pricetag-outline",
				color: "#3",
			},
			{
				id: "tr1",
				kind: "TRIP",
				title: "Goa",
				subtitle: "Trip",
				icon: "airplane-outline",
				color: "#4",
			},
			{
				id: "i1",
				kind: "INVESTMENT",
				title: "MF",
				subtitle: "Investment",
				icon: "trending-up",
				color: "#5",
			},
			{
				id: "b1",
				kind: "BUDGET",
				title: "Food",
				subtitle: "Monthly budget",
				icon: "speedometer-outline",
				color: "#6",
			},
			{
				id: "USD",
				kind: "EXCHANGE_RATE",
				title: "USD",
				subtitle: "Rate",
				icon: "earth-outline",
				color: "#7",
			},
		];

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return [[], vi.fn()];
			if (stateCall === 2) return ["lu", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = GlobalSearchScreen({
			navigation,
			route: {
				key: "k2",
				name: "GlobalSearch",
				params: { mode: "FINANCE" },
			},
		} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		for (const result of financeResults) {
			const row = screenList.props.renderItem({ item: result });
			findByPredicate(
				row,
				(node) => typeof node?.props?.onPress === "function",
			)[0]?.props?.onPress();
		}

		expect(serviceMocks.getTransactions).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getSources).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getCategories).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getTrips).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getInvestments).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getBudgets).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getExchangeRates).toHaveBeenCalledWith({
			id: "db",
		});

		expect(navigation.navigate).toHaveBeenCalledWith("TransactionForm", {
			transactionId: "tx1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("LinkedTransactions", {
			kind: "SOURCE",
			entityId: "s1",
			entityName: "Cash",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("LinkedTransactions", {
			kind: "CATEGORY",
			entityId: "c1",
			entityName: "Food",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("LinkedTransactions", {
			kind: "TRIP",
			entityId: "tr1",
			entityName: "Goa",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("LinkedTransactions", {
			kind: "INVESTMENT",
			entityId: "i1",
			entityName: "MF",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("BudgetForm", {
			budgetId: "b1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("ExchangeRates");
	});

	it("loads VAULT mode and opens PASSWORD CARD and IDENTITY results", async () => {
		const navigation = { navigate: vi.fn() };
		const vaultResults = [
			{
				id: "p1",
				kind: "PASSWORD",
				title: "Github",
				subtitle: "u",
				icon: "key-outline",
				color: "#1",
			},
			{
				id: "ca1",
				kind: "CARD",
				title: "Visa",
				subtitle: "VISA",
				icon: "card-outline",
				color: "#2",
			},
			{
				id: "id1",
				kind: "IDENTITY",
				title: "Passport",
				subtitle: "P1",
				icon: "person-circle-outline",
				color: "#3",
			},
		];

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return [[], vi.fn()];
			if (stateCall === 2) return ["pa", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = GlobalSearchScreen({
			navigation,
			route: {
				key: "k3",
				name: "GlobalSearch",
				params: { mode: "VAULT" },
			},
		} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		for (const result of vaultResults) {
			const row = screenList.props.renderItem({ item: result });
			findByPredicate(
				row,
				(node) => typeof node?.props?.onPress === "function",
			)[0]?.props?.onPress();
		}

		expect(serviceMocks.getPasswords).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getCards).toHaveBeenCalledWith({ id: "db" });
		expect(serviceMocks.getIdentities).toHaveBeenCalledWith({ id: "db" });
		expect(navigation.navigate).toHaveBeenCalledWith("VaultForm", {
			kind: "PASSWORD",
			entryId: "p1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("VaultForm", {
			kind: "CARD",
			entryId: "ca1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("VaultForm", {
			kind: "IDENTITY",
			entryId: "id1",
		});
	});

	it("covers short-query empty results and key extraction", async () => {
		const navigation = { navigate: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "n1",
							kind: "NOTE",
							title: "Note",
							subtitle: "Home",
							icon: "document-text-outline",
							color: "#00f",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["a", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = GlobalSearchScreen({
			navigation,
			route: {
				key: "k4",
				name: "GlobalSearch",
				params: { mode: "TOOLS" },
			},
		} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		expect(screenList.props.data).toEqual([]);
		expect(screenList.props.keyExtractor({ kind: "NOTE", id: "n1" })).toBe(
			"NOTE:n1",
		);
	});

	it("covers result filtering callback and TOOLS load error branch", async () => {
		const navigation = { navigate: vi.fn() };
		serviceMocks.getNotes.mockRejectedValueOnce(
			new Error("search load failed"),
		);

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "custom-1",
							kind: "PASSWORD",
							title: "Vault Entry",
							subtitle: "",
							icon: "key-outline",
							color: "#fa0",
							searchExtra: "special token",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["token", vi.fn()];
			if (stateCall === 3) return ["search load failed", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = GlobalSearchScreen({
			navigation,
			route: {
				key: "k5",
				name: "GlobalSearch",
				params: { mode: "TOOLS" },
			},
		} as any);
		await flush();

		expect(serviceMocks.getNotes).toHaveBeenCalledWith({ id: "db" });
		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.message === "search load failed",
			),
		).not.toHaveLength(0);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		expect(screenList.props.data).toHaveLength(1);
		const row = screenList.props.renderItem({
			item: screenList.props.data[0],
		});
		findByPredicate(
			row,
			(node) => typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();

		expect(navigation.navigate).toHaveBeenCalledWith("VaultForm", {
			kind: "PASSWORD",
			entryId: "custom-1",
		});
		expect(String(JSON.stringify(row) ?? "")).toContain("No details");
	});

	it("covers filtering when searchExtra is undefined", async () => {
		const navigation = { navigate: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "n3",
							kind: "NOTE",
							title: "Project plan",
							subtitle: "Folder",
							icon: "document-text-outline",
							color: "#00f",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["project", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = GlobalSearchScreen({
			navigation,
			route: {
				key: "k5b",
				name: "GlobalSearch",
				params: { mode: "TOOLS" },
			},
		} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		expect(screenList.props.data).toHaveLength(1);
		expect(screenList.props.data[0].id).toBe("n3");
	});

	it("covers TOOLS fallback subtitles when folder names are missing", async () => {
		const navigation = { navigate: vi.fn() };
		serviceMocks.getNotes.mockResolvedValueOnce([
			{ id: "n2", title: "Quick note", folderName: undefined },
		]);
		serviceMocks.getTodos.mockResolvedValueOnce([
			{ id: "t2", title: "Quick todo", folderName: undefined },
		]);

		const setResults = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return [[], setResults];
			if (stateCall === 2) return ["qu", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		GlobalSearchScreen({
			navigation,
			route: {
				key: "k6",
				name: "GlobalSearch",
				params: { mode: "TOOLS" },
			},
		} as any);
		await flush();
		await flush();

		expect(setResults).toHaveBeenCalledWith([
			expect.objectContaining({
				id: "n2",
				kind: "NOTE",
				subtitle: "Note",
			}),
			expect.objectContaining({
				id: "t2",
				kind: "TODO",
				subtitle: "Todo",
			}),
		]);
	});

	it("covers FINANCE mapped subtitle branches for income, yearly budget and missing extras", async () => {
		const navigation = { navigate: vi.fn() };
		serviceMocks.getTransactions.mockResolvedValueOnce([
			{
				id: "tx2",
				reason: "Rent",
				sourceName: "Bank",
				amount: "2000",
				sourceCurrencyCode: "INR",
				transactionAt: 12,
				categoryName: undefined,
				tripName: undefined,
				investmentName: undefined,
				destinationSourceName: undefined,
			},
		]);
		serviceMocks.getCategories.mockResolvedValueOnce([
			{ id: "c2", name: "Salary", isIncome: true },
		]);
		serviceMocks.getBudgets.mockResolvedValueOnce([
			{
				id: "b2",
				categoryName: "Salary",
				period: "YEARLY",
				amount: "120000",
			},
		]);

		const setResults = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return [[], setResults];
			if (stateCall === 2) return ["sa", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		GlobalSearchScreen({
			navigation,
			route: {
				key: "k7",
				name: "GlobalSearch",
				params: { mode: "FINANCE" },
			},
		} as any);
		await flush();
		await flush();

		expect(setResults).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					id: "c2",
					kind: "CATEGORY",
					subtitle: "Income category",
				}),
				expect.objectContaining({
					id: "b2",
					kind: "BUDGET",
					subtitle: expect.stringContaining("Yearly budget"),
				}),
				expect.objectContaining({
					id: "tx2",
					kind: "TRANSACTION",
					searchExtra: expect.stringContaining("2000"),
				}),
			]),
		);
	});

	it("covers VAULT fallback subtitle branches for password, card and identity", async () => {
		const navigation = { navigate: vi.fn() };
		serviceMocks.getPasswords.mockResolvedValueOnce([
			{
				id: "p2",
				title: "Work Mail",
				username: "",
				website: "mail.example",
			},
		]);
		serviceMocks.getCards.mockResolvedValueOnce([
			{ id: "ca2", name: "Offline Card", network: "" },
		]);
		serviceMocks.getIdentities.mockResolvedValueOnce([
			{ id: "id2", title: "Driver License", idNumber: "" },
		]);

		const setResults = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return [[], setResults];
			if (stateCall === 2) return ["wo", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		GlobalSearchScreen({
			navigation,
			route: {
				key: "k8",
				name: "GlobalSearch",
				params: { mode: "VAULT" },
			},
		} as any);
		await flush();
		await flush();

		expect(setResults).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					id: "p2",
					kind: "PASSWORD",
					subtitle: "mail.example",
				}),
				expect.objectContaining({
					id: "ca2",
					kind: "CARD",
					subtitle: "Card",
				}),
				expect.objectContaining({
					id: "id2",
					kind: "IDENTITY",
					subtitle: "Identity",
				}),
			]),
		);
	});
});
