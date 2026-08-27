import { beforeEach, describe, expect, it, vi } from "vitest";

import COLORS from "@/constants/colors";

const reactMocks = vi.hoisted(() => ({
	useEffect: vi.fn(),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getBudget: vi.fn(),
	saveBudget: vi.fn(),
	getCategories: vi.fn(),
	getNote: vi.fn(),
	saveNote: vi.fn(),
	deleteNote: vi.fn(),
	getTodo: vi.fn(),
	saveTodo: vi.fn(),
	deleteTodo: vi.fn(),
	getCategory: vi.fn(),
	saveCategory: vi.fn(),
	getInvestment: vi.fn(),
	saveInvestment: vi.fn(),
	createSource: vi.fn(),
	getSource: vi.fn(),
	updateSourceName: vi.fn(),
	getTrip: vi.fn(),
	saveTrip: vi.fn(),
	deleteCard: vi.fn(),
	getCard: vi.fn(),
	saveCard: vi.fn(),
	deleteIdentity: vi.fn(),
	getIdentity: vi.fn(),
	saveIdentity: vi.fn(),
	deletePassword: vi.fn(),
	getPassword: vi.fn(),
	savePassword: vi.fn(),
}));

const hookMocks = vi.hoisted(() => ({
	refreshData: vi.fn(),
	confirm: vi.fn(),
	processAttachment: vi.fn(),
	handleOpen: vi.fn(),
	handlePick: vi.fn(),
	handleRemove: vi.fn(),
	handleCreateFolder: vi.fn(),
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
	Switch: (props: any) => ({ type: "Switch", props }),
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
vi.mock("@/components/FolderPicker", () => ({
	default: (props: any) => ({ type: "FolderPicker", props }),
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

vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({ database: { id: "db" }, refreshData: hookMocks.refreshData }),
}));
vi.mock("@/hooks/useAppDialog", () => ({
	default: () => ({ confirm: hookMocks.confirm }),
}));
vi.mock("@/hooks/useFolders", () => ({
	default: () => ({ folders: [{ id: "f1", name: "Home" }], handleCreateFolder: hookMocks.handleCreateFolder }),
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

vi.mock("@/services/budgetService", () => ({
	default: {
		getBudget: serviceMocks.getBudget,
		saveBudget: serviceMocks.saveBudget,
	},
}));
vi.mock("@/services/categoryService", () => ({
	default: {
		getCategories: serviceMocks.getCategories,
		getCategory: serviceMocks.getCategory,
		saveCategory: serviceMocks.saveCategory,
	},
}));
vi.mock("@/services/investmentService", () => ({
	default: {
		getInvestment: serviceMocks.getInvestment,
		saveInvestment: serviceMocks.saveInvestment,
	},
}));
vi.mock("@/services/noteService", () => ({
	default: {
		getNote: serviceMocks.getNote,
		saveNote: serviceMocks.saveNote,
		deleteNote: serviceMocks.deleteNote,
	},
}));
vi.mock("@/services/sourceService", () => ({
	default: {
		createSource: serviceMocks.createSource,
		getSource: serviceMocks.getSource,
		updateSourceName: serviceMocks.updateSourceName,
	},
}));
vi.mock("@/services/todoService", () => ({
	default: {
		getTodo: serviceMocks.getTodo,
		saveTodo: serviceMocks.saveTodo,
		deleteTodo: serviceMocks.deleteTodo,
	},
}));
vi.mock("@/services/tripService", () => ({
	default: {
		getTrip: serviceMocks.getTrip,
		saveTrip: serviceMocks.saveTrip,
	},
}));
vi.mock("@/services/cardService", () => ({
	default: {
		deleteCard: serviceMocks.deleteCard,
		getCard: serviceMocks.getCard,
		saveCard: serviceMocks.saveCard,
	},
}));
vi.mock("@/services/identityService", () => ({
	default: {
		deleteIdentity: serviceMocks.deleteIdentity,
		getIdentity: serviceMocks.getIdentity,
		saveIdentity: serviceMocks.saveIdentity,
	},
}));
vi.mock("@/services/passwordService", () => ({
	default: {
		deletePassword: serviceMocks.deletePassword,
		getPassword: serviceMocks.getPassword,
		savePassword: serviceMocks.savePassword,
	},
}));

vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));

import BudgetFormScreen from "@/screens/BudgetFormScreen";
import NoteFormScreen from "@/screens/NoteFormScreen";
import RelationFormScreen from "@/screens/RelationFormScreen";
import TodoFormScreen from "@/screens/TodoFormScreen";
import VaultFormScreen from "@/screens/VaultFormScreen";

const flush = async (): Promise<void> => {
	await Promise.resolve();
	await Promise.resolve();
};

const findByType = (node: any, type: string, acc: any[] = []): any[] => {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((child) => findByType(child, type, acc));
		return acc;
	}
	if (node.type === type) acc.push(node);
	if (node.props) {
		Object.values(node.props).forEach((value) => findByType(value, type, acc));
	}
	return acc;
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

describe("form screens", () => {
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

		serviceMocks.getCategories.mockResolvedValue([
			{ id: "income", name: "Salary", isIncome: true },
			{ id: "expense", name: "Food", isIncome: false },
		]);
		serviceMocks.getBudget.mockResolvedValue({
			categoryId: "expense",
			amount: "500",
			period: "YEARLY",
		});
		serviceMocks.saveBudget.mockResolvedValue(undefined);

		serviceMocks.getNote.mockResolvedValue({
			title: "Existing",
			content: "Body",
			folderId: "f1",
		});
		serviceMocks.saveNote.mockResolvedValue("n1");
		serviceMocks.deleteNote.mockResolvedValue(undefined);

		serviceMocks.getTodo.mockResolvedValue({
			title: "Existing todo",
			description: "Details",
			folderId: "f1",
			isDone: true,
			dueAt: 123,
		});
		serviceMocks.saveTodo.mockResolvedValue("t1");
		serviceMocks.deleteTodo.mockResolvedValue(undefined);

		serviceMocks.getCategory.mockResolvedValue({
			name: "Food",
			isIncome: false,
		});
		serviceMocks.saveCategory.mockResolvedValue(undefined);
		serviceMocks.getInvestment.mockResolvedValue({ name: "MF" });
		serviceMocks.saveInvestment.mockResolvedValue(undefined);
		serviceMocks.createSource.mockResolvedValue(undefined);
		serviceMocks.getSource.mockResolvedValue({
			name: "Cash",
			currencyCode: "INR",
		});
		serviceMocks.updateSourceName.mockResolvedValue(undefined);
		serviceMocks.getTrip.mockResolvedValue({ name: "Goa" });
		serviceMocks.saveTrip.mockResolvedValue(undefined);

		serviceMocks.deleteCard.mockResolvedValue(undefined);
		serviceMocks.getCard.mockResolvedValue({
			name: "Visa",
			cardNumber: "1111",
			cardType: "CREDIT_CARD",
			expiry: "12/30",
			cvv: "111",
			pin: "0000",
			network: "VISA",
			notes: "n",
		});
		serviceMocks.saveCard.mockResolvedValue("card1");
		serviceMocks.deleteIdentity.mockResolvedValue(undefined);
		serviceMocks.getIdentity.mockResolvedValue({
			title: "Passport",
			idNumber: "P1",
			notes: "n",
		});
		serviceMocks.saveIdentity.mockResolvedValue("id1");
		serviceMocks.deletePassword.mockResolvedValue(undefined);
		serviceMocks.getPassword.mockResolvedValue({
			title: "Github",
			username: "u",
			password: "p",
			website: "w",
			notes: "n",
		});
		serviceMocks.savePassword.mockResolvedValue("pw1");

		hookMocks.processAttachment.mockResolvedValue(undefined);
	});

	it("executes RelationFormScreen source and category branches", async () => {
		const navigation = { goBack: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => {
			onConfirm();
		});

		const sourceTree = RelationFormScreen({
			navigation,
			route: {
				key: "k",
				name: "RelationForm",
				params: { kind: "SOURCE", entityId: "s1" },
			},
		} as any);
		await flush();
		findByPredicate(
			sourceTree,
			(node) => node?.props?.label === "Save" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(serviceMocks.getSource).toHaveBeenCalledWith({ id: "db" }, "s1");
		expect(serviceMocks.updateSourceName).toHaveBeenCalled();

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 3) return [true, vi.fn()];
			if (stateCall === 4) return [false, vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const categoryTree = RelationFormScreen({
			navigation,
			route: {
				key: "k2",
				name: "RelationForm",
				params: { kind: "CATEGORY", entityId: "c1" },
			},
		} as any);
		await flush();
		findByPredicate(
			categoryTree,
			(node) => node?.props?.label === "Save" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(hookMocks.confirm).toHaveBeenCalled();
		expect(serviceMocks.saveCategory).toHaveBeenCalled();
		expect(navigation.goBack).toHaveBeenCalled();
	});

	it("covers RelationFormScreen create source, trip, investment, and save-error branches", async () => {
		const navigation = { goBack: vi.fn() };

		const newSourceTree = RelationFormScreen({
			navigation,
			route: {
				key: "k-new-source",
				name: "RelationForm",
				params: { kind: "SOURCE" },
			},
		} as any);
		await flush();
		findByPredicate(
			newSourceTree,
			(node) => node?.props?.label === "Save" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		const tripTree = RelationFormScreen({
			navigation,
			route: {
				key: "k-trip",
				name: "RelationForm",
				params: { kind: "TRIP", entityId: "t1" },
			},
		} as any);
		await flush();
		findByPredicate(
			tripTree,
			(node) => node?.props?.label === "Save" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		const investmentTree = RelationFormScreen({
			navigation,
			route: {
				key: "k-investment",
				name: "RelationForm",
				params: { kind: "INVESTMENT", entityId: "i1" },
			},
		} as any);
		await flush();
		findByPredicate(
			investmentTree,
			(node) => node?.props?.label === "Save" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		serviceMocks.saveTrip.mockRejectedValueOnce(new Error("trip save failed"));
		const failingTripTree = RelationFormScreen({
			navigation,
			route: {
				key: "k-trip-fail",
				name: "RelationForm",
				params: { kind: "TRIP", entityId: "t1" },
			},
		} as any);
		await flush();
		findByPredicate(
			failingTripTree,
			(node) => node?.props?.label === "Save" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.createSource).toHaveBeenCalled();
		expect(serviceMocks.getTrip).toHaveBeenCalledWith({ id: "db" }, "t1");
		expect(serviceMocks.saveTrip).toHaveBeenCalled();
		expect(serviceMocks.getInvestment).toHaveBeenCalledWith({ id: "db" }, "i1");
		expect(serviceMocks.saveInvestment).toHaveBeenCalled();
	});

	it("covers RelationFormScreen load-error and category switch/error render branches", async () => {
		const navigation = { goBack: vi.fn() };
		serviceMocks.getInvestment.mockRejectedValueOnce(new Error("investment load failed"));

		const setError = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 6) return ["", setError];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		RelationFormScreen({
			navigation,
			route: {
				key: "k-investment-load-fail",
				name: "RelationForm",
				params: { kind: "INVESTMENT", entityId: "i1" },
			},
		} as any);
		await flush();
		await flush();

		expect(setError).toHaveBeenCalledWith("investment load failed");

		stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 3) return [false, vi.fn()];
			if (stateCall === 6) return ["manual error", vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const categoryTree = RelationFormScreen({
			navigation,
			route: {
				key: "k-category-false-switch",
				name: "RelationForm",
				params: { kind: "CATEGORY", entityId: "c1" },
			},
		} as any);
		await flush();

		const switchNode = findByPredicate(
			categoryTree,
			(node) => typeof node?.props?.onValueChange === "function" && node?.props?.thumbColor,
		)[0];
		expect(switchNode?.props?.thumbColor).toBe(COLORS.textMuted);
		expect(
			findByPredicate(
				categoryTree,
				(node) => node?.props?.message === "manual error" && node?.props?.tone === "danger",
			),
		).not.toHaveLength(0);
	});

	it("executes VaultFormScreen branches for password card and identity", async () => {
		const navigation = { goBack: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => {
			onConfirm();
		});

		const passwordTree = VaultFormScreen({
			navigation,
			route: {
				key: "p",
				name: "VaultForm",
				params: { kind: "PASSWORD", entryId: "pw1" },
			},
		} as any);
		await flush();
		findByPredicate(
			passwordTree,
			(node) => node?.props?.label === "Save entry" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		findByPredicate(
			passwordTree,
			(node) => node?.props?.label === "Delete entry" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		const cardTree = VaultFormScreen({
			navigation,
			route: {
				key: "c",
				name: "VaultForm",
				params: { kind: "CARD", entryId: "card1" },
			},
		} as any);
		await flush();
		findByPredicate(
			cardTree,
			(node) => node?.props?.label === "Save entry" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		findByPredicate(
			cardTree,
			(node) => node?.props?.label === "Delete entry" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		const identityTree = VaultFormScreen({
			navigation,
			route: {
				key: "i",
				name: "VaultForm",
				params: { kind: "IDENTITY", entryId: "id1" },
			},
		} as any);
		await flush();
		findByPredicate(
			identityTree,
			(node) => node?.props?.label === "Save entry" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		findByPredicate(
			identityTree,
			(node) => node?.props?.label === "Delete entry" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.getPassword).toHaveBeenCalledWith({ id: "db" }, "pw1");
		expect(serviceMocks.savePassword).toHaveBeenCalled();
		expect(serviceMocks.deletePassword).toHaveBeenCalledWith({ id: "db" }, "pw1");

		expect(serviceMocks.getCard).toHaveBeenCalledWith({ id: "db" }, "card1");
		expect(serviceMocks.saveCard).toHaveBeenCalled();
		expect(serviceMocks.deleteCard).toHaveBeenCalledWith({ id: "db" }, "card1");

		expect(serviceMocks.getIdentity).toHaveBeenCalledWith({ id: "db" }, "id1");
		expect(serviceMocks.saveIdentity).toHaveBeenCalled();
		expect(serviceMocks.deleteIdentity).toHaveBeenCalledWith({ id: "db" }, "id1");
		expect(hookMocks.processAttachment).toHaveBeenCalledWith("card1");
		expect(hookMocks.processAttachment).toHaveBeenCalledWith("id1");
	});

	it("covers VaultFormScreen error and callback wrapper branches", async () => {
		const navigation = { goBack: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => {
			onConfirm();
		});

		serviceMocks.getCard.mockRejectedValueOnce(new Error("load card failed"));
		serviceMocks.saveCard.mockRejectedValueOnce(new Error("save card failed"));
		serviceMocks.deleteCard.mockRejectedValueOnce(new Error("delete card failed"));

		const setError = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 14) return ["", setError];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const cardTree = VaultFormScreen({
			navigation,
			route: {
				key: "vault-card-errors",
				name: "VaultForm",
				params: { kind: "CARD", entryId: "card1" },
			},
		} as any);
		await flush();
		await flush();

		expect(setError).toHaveBeenCalledWith("load card failed");

		findByPredicate(
			cardTree,
			(node) => node?.props?.label === "Card type" && typeof node?.props?.onChange === "function",
		)[0]?.props?.onChange("DEBIT_CARD");

		const attachment = findByPredicate(
			cardTree,
			(node) =>
				typeof node?.props?.onOpen === "function" &&
				typeof node?.props?.onPick === "function" &&
				typeof node?.props?.onRemove === "function",
		)[0];
		await attachment?.props?.onOpen();
		await attachment?.props?.onPick();
		attachment?.props?.onRemove();

		findByPredicate(
			cardTree,
			(node) => node?.props?.label === "Save entry" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			cardTree,
			(node) => node?.props?.label === "Delete entry" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(hookMocks.handleOpen).toHaveBeenCalled();
		expect(hookMocks.handlePick).toHaveBeenCalled();
		expect(hookMocks.handleRemove).toHaveBeenCalled();
		expect(setError).toHaveBeenCalledWith("save card failed");
		expect(setError).toHaveBeenCalledWith("delete card failed");
	});

	it("executes BudgetFormScreen load and save paths", async () => {
		const navigation = { goBack: vi.fn() };
		const tree = BudgetFormScreen({
			navigation,
			route: { key: "k", name: "BudgetForm", params: { budgetId: "b1" } },
		} as any);
		await flush();

		const saveNode = findByPredicate(
			tree,
			(node) => node?.props?.label === "Save budget" && typeof node?.props?.onPress === "function",
		)[0];
		saveNode?.props?.onPress();
		await flush();

		expect(serviceMocks.getCategories).toHaveBeenCalled();
		expect(serviceMocks.getBudget).toHaveBeenCalledWith({ id: "db" }, "b1");
		expect(serviceMocks.saveBudget).toHaveBeenCalled();
		expect(hookMocks.refreshData).toHaveBeenCalled();
		expect(navigation.goBack).toHaveBeenCalled();
	});

	it("covers BudgetFormScreen load and save error branches", async () => {
		const navigation = { goBack: vi.fn() };
		serviceMocks.getCategories.mockRejectedValueOnce(new Error("load failed"));
		serviceMocks.saveBudget.mockRejectedValueOnce(new Error("save failed"));

		const tree = BudgetFormScreen({
			navigation,
			route: { key: "k-err", name: "BudgetForm", params: {} },
		} as any);
		await flush();

		const saveNode = findByPredicate(
			tree,
			(node) => node?.props?.label === "Save budget" && typeof node?.props?.onPress === "function",
		)[0];
		saveNode?.props?.onPress();
		await flush();

		expect(navigation.goBack).not.toHaveBeenCalled();
	});

	it("renders BudgetFormScreen error notice branch", async () => {
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 6) return ["boom", vi.fn()];
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = BudgetFormScreen({
			navigation: { goBack: vi.fn() },
			route: { key: "k-render", name: "BudgetForm", params: {} },
		} as any);
		await flush();

		expect(findByPredicate(tree, (node) => node?.props?.message === "boom")).not.toHaveLength(0);
	});

	it("covers BudgetFormScreen category mapping and period toggle branches", async () => {
		const setPeriod = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (initial === "MONTHLY") return ["MONTHLY", setPeriod];
			if (call === 4) {
				return [
					[
						{ id: "expense", name: "Food", isIncome: false },
						{ id: "travel", name: "Travel", isIncome: false },
					],
					vi.fn(),
				];
			}
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = BudgetFormScreen({
			navigation: { goBack: vi.fn() },
			route: { key: "k-period", name: "BudgetForm", params: {} },
		} as any);
		await flush();

		const select = findByPredicate(tree, (node) => node?.props?.label === "Expense category")[0];
		expect(select?.props?.options).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ label: "Food", value: "expense" }),
				expect.objectContaining({ label: "Travel", value: "travel" }),
			]),
		);

		const segmented = findByPredicate(
			tree,
			(node) =>
				Array.isArray(node?.props?.options) &&
				node.props.options.some((option: any) => option?.value === "MONTHLY"),
		)[0];
		expect(segmented).toBeTruthy();
		segmented?.props?.onChange("YEARLY");
		segmented?.props?.onChange("OTHER");
		expect(setPeriod).toHaveBeenCalledWith("YEARLY");
		expect(setPeriod).toHaveBeenCalledWith("MONTHLY");
	});

	it("executes NoteFormScreen save and delete paths", async () => {
		const navigation = { goBack: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => {
			onConfirm();
		});

		const tree = NoteFormScreen({
			navigation,
			route: { key: "k", name: "NoteForm", params: { noteId: "n1" } },
		} as any);
		await flush();

		const saveNode = findByPredicate(
			tree,
			(node) => node?.props?.label === "Save note" && typeof node?.props?.onPress === "function",
		)[0];
		saveNode?.props?.onPress();
		await flush();
		const deleteNode = findByPredicate(
			tree,
			(node) => node?.props?.label === "Delete note" && typeof node?.props?.onPress === "function",
		)[0];
		deleteNode?.props?.onPress();
		await flush();

		expect(serviceMocks.getNote).toHaveBeenCalledWith({ id: "db" }, "n1");
		expect(serviceMocks.saveNote).toHaveBeenCalled();
		expect(hookMocks.processAttachment).toHaveBeenCalledWith("n1");
		const attachmentNode = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onOpen === "function" &&
				typeof node?.props?.onPick === "function" &&
				typeof node?.props?.onRemove === "function",
		)[0];
		await attachmentNode?.props?.onOpen();
		await attachmentNode?.props?.onPick();
		attachmentNode?.props?.onRemove();
		expect(hookMocks.handleOpen).toHaveBeenCalled();
		expect(hookMocks.handlePick).toHaveBeenCalled();
		expect(hookMocks.handleRemove).toHaveBeenCalled();
		expect(hookMocks.confirm).toHaveBeenCalled();
		expect(serviceMocks.deleteNote).toHaveBeenCalledWith({ id: "db" }, "n1");
		expect(navigation.goBack).toHaveBeenCalled();
	});

	it("covers NoteFormScreen new-note and save/delete error branches", async () => {
		const navigation = { goBack: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => {
			onConfirm();
		});
		serviceMocks.getNote.mockRejectedValueOnce(new Error("load failed"));
		serviceMocks.saveNote.mockRejectedValueOnce(new Error("save failed"));
		serviceMocks.deleteNote.mockRejectedValueOnce(new Error("delete failed"));

		const existingTree = NoteFormScreen({
			navigation,
			route: { key: "k-note-fail", name: "NoteForm", params: { noteId: "n1" } },
		} as any);
		await flush();

		findByPredicate(
			existingTree,
			(node) => node?.props?.label === "Save note" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			existingTree,
			(node) => node?.props?.label === "Delete note" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(navigation.goBack).not.toHaveBeenCalled();

		const newTree = NoteFormScreen({
			navigation: { goBack: vi.fn() },
			route: { key: "k-note-new", name: "NoteForm", params: {} },
		} as any);
		await flush();

		expect(
			findByPredicate(newTree, (node) => node?.props?.label === "Delete note"),
		).toHaveLength(0);
	});

	it("executes TodoFormScreen save/delete and due-date branch", async () => {
		const navigation = { goBack: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => {
			onConfirm();
		});

		reactMocks.useState.mockImplementation((initial: any) => {
			if (initial === false) {
				return [true, vi.fn()];
			}
			return [typeof initial === "function" ? initial() : initial, vi.fn()];
		});

		const tree = TodoFormScreen({
			navigation,
			route: { key: "k", name: "TodoForm", params: { todoId: "t1" } },
		} as any);
		await flush();

		const dueNode = findByPredicate(tree, (node) => node?.props?.label === "Due")[0];
		expect(dueNode).toBeTruthy();

		const saveNode = findByPredicate(
			tree,
			(node) => node?.props?.label === "Save todo" && typeof node?.props?.onPress === "function",
		)[0];
		saveNode?.props?.onPress();
		await flush();
		const deleteNode = findByPredicate(
			tree,
			(node) => node?.props?.label === "Delete todo" && typeof node?.props?.onPress === "function",
		)[0];
		deleteNode?.props?.onPress();
		await flush();

		expect(serviceMocks.getTodo).toHaveBeenCalledWith({ id: "db" }, "t1");
		expect(serviceMocks.saveTodo).toHaveBeenCalled();
		expect(serviceMocks.deleteTodo).toHaveBeenCalledWith({ id: "db" }, "t1");
		const attachmentNode = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onOpen === "function" &&
				typeof node?.props?.onPick === "function" &&
				typeof node?.props?.onRemove === "function",
		)[0];
		await attachmentNode?.props?.onOpen();
		await attachmentNode?.props?.onPick();
		attachmentNode?.props?.onRemove();
		expect(hookMocks.handleOpen).toHaveBeenCalled();
		expect(hookMocks.handlePick).toHaveBeenCalled();
		expect(hookMocks.handleRemove).toHaveBeenCalled();
		expect(navigation.goBack).toHaveBeenCalled();
	});

	it("covers TodoFormScreen new-todo and save/delete/load error branches", async () => {
		const navigation = { goBack: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => {
			onConfirm();
		});
		serviceMocks.getTodo.mockRejectedValueOnce(new Error("load failed"));
		serviceMocks.saveTodo.mockRejectedValueOnce(new Error("save failed"));
		serviceMocks.deleteTodo.mockRejectedValueOnce(new Error("delete failed"));

		const existingTree = TodoFormScreen({
			navigation,
			route: { key: "k-todo-fail", name: "TodoForm", params: { todoId: "t1" } },
		} as any);
		await flush();

		findByPredicate(
			existingTree,
			(node) => node?.props?.label === "Save todo" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			existingTree,
			(node) => node?.props?.label === "Delete todo" && typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(navigation.goBack).not.toHaveBeenCalled();

		const newTree = TodoFormScreen({
			navigation: { goBack: vi.fn() },
			route: { key: "k-todo-new", name: "TodoForm", params: {} },
		} as any);
		await flush();

		expect(
			findByPredicate(newTree, (node) => node?.props?.label === "Delete todo"),
		).toHaveLength(0);
	});
});
