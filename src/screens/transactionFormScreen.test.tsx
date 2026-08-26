import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useEffect: vi.fn(),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getCategories: vi.fn(),
	getInvestments: vi.fn(),
	getDefaultTripId: vi.fn(),
	getSources: vi.fn(),
	deleteTransaction: vi.fn(),
	getTransaction: vi.fn(),
	saveTransaction: vi.fn(),
	getTrips: vi.fn(),
}));

const hookMocks = vi.hoisted(() => ({
	refreshData: vi.fn(),
	confirm: vi.fn(),
	processAttachment: vi.fn(),
	handleOpen: vi.fn(),
	handlePick: vi.fn(),
	handleRemove: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useEffect: reactMocks.useEffect,
		useState: reactMocks.useState,
	};
});

vi.mock("react-native", () => ({
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("@/components/AppButton", () => ({
	default: (props: any) => ({ type: "AppButton", props }),
}));
vi.mock("@/components/AttachmentField", () => ({
	default: (props: any) => ({ type: "AttachmentField", props }),
}));
vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));
vi.mock("@/components/DateField", () => ({
	default: (props: any) => ({ type: "DateField", props }),
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
vi.mock("@/components/SegmentedControl", () => ({
	default: (props: any) => ({ type: "SegmentedControl", props }),
}));
vi.mock("@/components/SelectField", () => ({
	default: (props: any) => ({ type: "SelectField", props }),
}));
vi.mock("@/components/TextField", () => ({
	default: (props: any) => ({ type: "TextField", props }),
}));

vi.mock("@/hooks/useAppDialog", () => ({
	default: () => ({ confirm: hookMocks.confirm }),
}));
vi.mock("@/hooks/useAttachment", () => ({
	default: () => ({
		existingAttachment: null,
		isRemoved: false,
		pendingAttachment: null,
		processAttachment: hookMocks.processAttachment,
		handleOpen: hookMocks.handleOpen,
		handlePick: hookMocks.handlePick,
		handleRemove: hookMocks.handleRemove,
	}),
}));
vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({ database: { id: "db" }, refreshData: hookMocks.refreshData }),
}));

vi.mock("@/services/categoryService", () => ({
	default: { getCategories: serviceMocks.getCategories },
}));
vi.mock("@/services/investmentService", () => ({
	default: { getInvestments: serviceMocks.getInvestments },
}));
vi.mock("@/services/settingsService", () => ({
	default: { getDefaultTripId: serviceMocks.getDefaultTripId },
}));
vi.mock("@/services/sourceService", () => ({
	default: { getSources: serviceMocks.getSources },
}));
vi.mock("@/services/transactionService", () => ({
	default: {
		deleteTransaction: serviceMocks.deleteTransaction,
		getTransaction: serviceMocks.getTransaction,
		saveTransaction: serviceMocks.saveTransaction,
	},
}));
vi.mock("@/services/tripService", () => ({
	default: { getTrips: serviceMocks.getTrips },
}));

vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));

import TransactionFormScreen from "@/screens/TransactionFormScreen";

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

describe("TransactionFormScreen", () => {
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

		serviceMocks.getSources.mockResolvedValue([
			{ id: "s1", name: "Cash", currencyCode: "INR", balance: "0" },
			{ id: "s2", name: "Bank", currencyCode: "INR", balance: "0" },
		]);
		serviceMocks.getCategories.mockResolvedValue([{ id: "c1", name: "Food", isIncome: false }]);
		serviceMocks.getTrips.mockResolvedValue([{ id: "tr1", name: "Goa" }]);
		serviceMocks.getInvestments.mockResolvedValue([{ id: "i1", name: "MF" }]);
		serviceMocks.getDefaultTripId.mockResolvedValue("tr1");
		serviceMocks.getTransaction.mockResolvedValue(null);
		serviceMocks.saveTransaction.mockResolvedValue("txSaved");
		serviceMocks.deleteTransaction.mockResolvedValue(undefined);
		hookMocks.processAttachment.mockResolvedValue(undefined);
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => onConfirm());
	});

	it("saves GENERAL transfer with derived toAmount and deletes existing transaction", async () => {
		const navigation = { goBack: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["GENERAL", vi.fn()];
			if (stateCall === 2) return ["TRANSFER", vi.fn()];
			if (stateCall === 3) return ["s1", vi.fn()];
			if (stateCall === 4) return ["s2", vi.fn()];
			if (stateCall === 5) return ["100", vi.fn()];
			if (stateCall === 6) return ["", vi.fn()];
			if (stateCall === 7) return ["", vi.fn()];
			if (stateCall === 8) return ["", vi.fn()];
			if (stateCall === 9) return ["", vi.fn()];
			if (stateCall === 10) return ["Move", vi.fn()];
			if (stateCall === 11) return [123, vi.fn()];
			if (stateCall === 12)
				return [[
					{ id: "s1", name: "Cash", currencyCode: "INR", balance: "0" },
					{ id: "s2", name: "Bank", currencyCode: "INR", balance: "0" },
				], vi.fn()];
			if (stateCall === 13) return [[{ id: "c1", name: "Food", isIncome: false }], vi.fn()];
			if (stateCall === 14) return [[{ id: "tr1", name: "Goa" }], vi.fn()];
			if (stateCall === 15) return [[{ id: "i1", name: "MF" }], vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k", name: "TransactionForm", params: { transactionId: "tx1" } },
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) => node?.props?.label === "Save transaction" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			tree,
			(node) => node?.props?.label === "Delete transaction" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.saveTransaction).toHaveBeenCalledWith({ id: "db" }, {
			id: "tx1",
			classification: "GENERAL",
			type: "TRANSFER",
			sourceId: "s1",
			destinationSourceId: "s2",
			amount: "100",
			toAmount: "100",
			categoryId: undefined,
			tripId: undefined,
			investmentId: undefined,
			reason: "Move",
			transactionAt: 123,
		});
		expect(hookMocks.processAttachment).toHaveBeenCalledWith("txSaved");
		expect(serviceMocks.deleteTransaction).toHaveBeenCalledWith({ id: "db" }, "tx1");
		expect(hookMocks.refreshData).toHaveBeenCalled();
		expect(navigation.goBack).toHaveBeenCalled();
	});

	it("saves INVESTMENT transaction with investmentId branch", async () => {
		const navigation = { goBack: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["INVESTMENT", vi.fn()];
			if (stateCall === 2) return ["CREDIT", vi.fn()];
			if (stateCall === 3) return ["s1", vi.fn()];
			if (stateCall === 4) return ["", vi.fn()];
			if (stateCall === 5) return ["250", vi.fn()];
			if (stateCall === 6) return ["", vi.fn()];
			if (stateCall === 7) return ["", vi.fn()];
			if (stateCall === 8) return ["", vi.fn()];
			if (stateCall === 9) return ["i1", vi.fn()];
			if (stateCall === 10) return ["Invest", vi.fn()];
			if (stateCall === 11) return [456, vi.fn()];
			if (stateCall === 12)
				return [[{ id: "s1", name: "Cash", currencyCode: "INR", balance: "0" }], vi.fn()];
			if (stateCall === 13) return [[{ id: "c1", name: "Food", isIncome: false }], vi.fn()];
			if (stateCall === 14) return [[{ id: "tr1", name: "Goa" }], vi.fn()];
			if (stateCall === 15) return [[{ id: "i1", name: "MF" }], vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k2", name: "TransactionForm", params: {} },
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) => node?.props?.label === "Save transaction" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.saveTransaction).toHaveBeenCalledWith({ id: "db" }, {
			id: undefined,
			classification: "INVESTMENT",
			type: "CREDIT",
			sourceId: "s1",
			destinationSourceId: undefined,
			amount: "250",
			toAmount: undefined,
			categoryId: undefined,
			tripId: undefined,
			investmentId: "i1",
			reason: "Invest",
			transactionAt: 456,
		});
		expect(hookMocks.processAttachment).toHaveBeenCalledWith("txSaved");
		expect(navigation.goBack).toHaveBeenCalled();
	});

	it("shows source warning and disables save when no sources exist", async () => {
		serviceMocks.getSources.mockResolvedValue([]);
		const navigation = { goBack: vi.fn() };
		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k3", name: "TransactionForm", params: {} },
		} as any);
		await flush();

		const saveButton = findByPredicate(
			tree,
			(node) => node?.props?.label === "Save transaction",
		)[0];
		expect(saveButton?.props?.isDisabled).toBe(true);
		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.message === "Create a source before adding transactions.",
			),
		).not.toHaveLength(0);
	});

	it("covers attachment actions", async () => {
		const navigation = { goBack: vi.fn() };

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k4", name: "TransactionForm", params: {} },
		} as any);
		await flush();

		const attachment = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onOpen === "function" &&
				typeof node?.props?.onPick === "function" &&
				typeof node?.props?.onRemove === "function",
		)[0];
		await attachment?.props?.onOpen();
		await attachment?.props?.onPick();
		attachment?.props?.onRemove();

		expect(hookMocks.handleOpen).toHaveBeenCalled();
		expect(hookMocks.handlePick).toHaveBeenCalled();
		expect(hookMocks.handleRemove).toHaveBeenCalled();
	});

	it("covers save and delete error branches", async () => {
		const navigation = { goBack: vi.fn() };
		serviceMocks.saveTransaction.mockRejectedValueOnce(new Error("save failed"));
		serviceMocks.deleteTransaction.mockRejectedValueOnce(new Error("delete failed"));

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k5", name: "TransactionForm", params: { transactionId: "tx1" } },
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) => node?.props?.label === "Save transaction" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			tree,
			(node) => node?.props?.label === "Delete transaction" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.saveTransaction).toHaveBeenCalled();
		expect(serviceMocks.deleteTransaction).toHaveBeenCalledWith({ id: "db" }, "tx1");
		expect(navigation.goBack).not.toHaveBeenCalled();
	});

	it("preloads existing transaction fields and keeps date in edit mode", async () => {
		const navigation = { goBack: vi.fn() };
		serviceMocks.getTransaction.mockResolvedValueOnce({
			id: "tx1",
			classification: "GENERAL",
			type: "DEBIT",
			sourceId: "s1",
			destinationSourceId: null,
			amount: "77",
			toAmount: null,
			categoryId: "c1",
			tripId: "tr1",
			investmentId: null,
			reason: "Lunch",
			transactionAt: 12345,
		});

		const setTransactionAt = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 11) return [111, setTransactionAt];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		TransactionFormScreen({
			navigation,
			route: { key: "k6", name: "TransactionForm", params: { transactionId: "tx1" } },
		} as any);
		await flush();
		await flush();

		expect(setTransactionAt).toHaveBeenCalledWith(12345);
	});

	it("does not copy original date when cloning a transaction", async () => {
		const navigation = { goBack: vi.fn() };
		serviceMocks.getTransaction.mockResolvedValueOnce({
			id: "tx1",
			classification: "GENERAL",
			type: "DEBIT",
			sourceId: "s1",
			destinationSourceId: null,
			amount: "77",
			toAmount: null,
			categoryId: "c1",
			tripId: "tr1",
			investmentId: null,
			reason: "Lunch",
			transactionAt: 12345,
		});

		const setTransactionAt = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 11) return [111, setTransactionAt];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		TransactionFormScreen({
			navigation,
			route: { key: "k7", name: "TransactionForm", params: { cloneFromTransactionId: "tx1" } },
		} as any);
		await flush();
		await flush();

		expect(setTransactionAt).not.toHaveBeenCalled();
	});

	it("covers classification and type segmented-control handlers", async () => {
		const navigation = { goBack: vi.fn() };
		const setClassification = vi.fn();
		const setType = vi.fn();

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["GENERAL", setClassification];
			if (stateCall === 2) return ["TRANSFER", setType];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k8", name: "TransactionForm", params: {} },
		} as any);
		await flush();

		const segmentedControls = findByPredicate(
			tree,
			(node) => typeof node?.props?.onChange === "function" && Array.isArray(node?.props?.options),
		);
		segmentedControls[0]?.props?.onChange("INVESTMENT");
		segmentedControls[1]?.props?.onChange("CREDIT");
		segmentedControls[1]?.props?.onChange("SOMETHING_ELSE");

		expect(setClassification).toHaveBeenCalledWith("INVESTMENT");
		expect(setType).toHaveBeenCalledWith("CREDIT");
		expect(setType).toHaveBeenCalledWith("DEBIT");
	});

	it("covers initial form load error branch", async () => {
		const navigation = { goBack: vi.fn() };
		serviceMocks.getSources.mockRejectedValueOnce(new Error("load failed"));
		const setError = vi.fn();

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 17) return ["", setError];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k10", name: "TransactionForm", params: {} },
		} as any);
		await flush();
		await flush();

		expect(setError).toHaveBeenCalledWith("load failed");
		expect(tree).toBeTruthy();
	});

	it("saves GENERAL non-transfer with category and trip payload fields", async () => {
		const navigation = { goBack: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["GENERAL", vi.fn()];
			if (stateCall === 2) return ["DEBIT", vi.fn()];
			if (stateCall === 3) return ["s1", vi.fn()];
			if (stateCall === 4) return ["", vi.fn()];
			if (stateCall === 5) return ["300", vi.fn()];
			if (stateCall === 6) return ["", vi.fn()];
			if (stateCall === 7) return ["c1", vi.fn()];
			if (stateCall === 8) return ["tr1", vi.fn()];
			if (stateCall === 9) return ["", vi.fn()];
			if (stateCall === 10) return ["Groceries", vi.fn()];
			if (stateCall === 11) return [789, vi.fn()];
			if (stateCall === 12)
				return [[{ id: "s1", name: "Cash", currencyCode: "INR", balance: "0" }], vi.fn()];
			if (stateCall === 13)
				return [[{ id: "c1", name: "Food", isIncome: false }], vi.fn()];
			if (stateCall === 14) return [[{ id: "tr1", name: "Goa" }], vi.fn()];
			if (stateCall === 15) return [[{ id: "i1", name: "MF" }], vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k9", name: "TransactionForm", params: {} },
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) => node?.props?.label === "Save transaction" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.saveTransaction).toHaveBeenCalledWith({ id: "db" }, {
			id: undefined,
			classification: "GENERAL",
			type: "DEBIT",
			sourceId: "s1",
			destinationSourceId: undefined,
			amount: "300",
			toAmount: undefined,
			categoryId: "c1",
			tripId: "tr1",
			investmentId: undefined,
			reason: "Groceries",
			transactionAt: 789,
		});
	});
});
