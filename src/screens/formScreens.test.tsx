import { beforeEach, describe, expect, it, vi } from "vitest";

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
	},
}));
vi.mock("@/services/noteService", () => ({
	default: {
		getNote: serviceMocks.getNote,
		saveNote: serviceMocks.saveNote,
		deleteNote: serviceMocks.deleteNote,
	},
}));
vi.mock("@/services/todoService", () => ({
	default: {
		getTodo: serviceMocks.getTodo,
		saveTodo: serviceMocks.saveTodo,
		deleteTodo: serviceMocks.deleteTodo,
	},
}));

vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));

import BudgetFormScreen from "@/screens/BudgetFormScreen";
import NoteFormScreen from "@/screens/NoteFormScreen";
import TodoFormScreen from "@/screens/TodoFormScreen";

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
		hookMocks.processAttachment.mockResolvedValue(undefined);
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
		expect(hookMocks.confirm).toHaveBeenCalled();
		expect(serviceMocks.deleteNote).toHaveBeenCalledWith({ id: "db" }, "n1");
		expect(navigation.goBack).toHaveBeenCalled();
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
		expect(navigation.goBack).toHaveBeenCalled();
	});
});
