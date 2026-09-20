import type AppButtonProps from "@/types/AppButtonProps";
import type AppDialogConfirmOptions from "@/types/AppDialogConfirmOptions";
import type InvestmentTypePickerProps from "@/types/InvestmentTypePickerProps";
import type NoticeProps from "@/types/NoticeProps";
import type TextFieldProps from "@/types/TextFieldProps";
import { isValidElement, type ReactElement } from "react";
import type { SwitchProps } from "react-native";
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
	useEffect: vi.fn(),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getBudget: vi.fn(),
	saveBudget: vi.fn(),
	getCategories: vi.fn(),
	getCategory: vi.fn(),
	saveCategory: vi.fn(),
	getSource: vi.fn(),
	createSource: vi.fn(),
	updateSourceName: vi.fn(),
	getTrip: vi.fn(),
	saveTrip: vi.fn(),
	getInvestment: vi.fn(),
	saveInvestment: vi.fn(),
	getInvestmentTypes: vi.fn(),
	saveInvestmentType: vi.fn(),
	getNote: vi.fn(),
	saveNote: vi.fn(),
	deleteNote: vi.fn(),
	getTodo: vi.fn(),
	saveTodo: vi.fn(),
	deleteTodo: vi.fn(),
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
	const actual = await importOriginal<typeof import("react")>();
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
vi.mock("@/components/InvestmentTypePicker", () => ({
	default: (props: unknown) => ({ type: "InvestmentTypePicker", props }),
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
	default: () => ({
		database: { id: "db" },
		refreshData: hookMocks.refreshData,
	}),
}));
vi.mock("@/hooks/useAppDialog", () => ({
	default: () => ({ confirm: hookMocks.confirm }),
}));
vi.mock("@/hooks/useFolders", () => ({
	default: () => ({
		folders: [{ id: "f1", name: "Home" }],
		handleCreateFolder: hookMocks.handleCreateFolder,
	}),
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
vi.mock("@/services/sourceService", () => ({
	default: {
		getSource: serviceMocks.getSource,
		createSource: serviceMocks.createSource,
		updateSourceName: serviceMocks.updateSourceName,
	},
}));
vi.mock("@/services/tripService", () => ({
	default: { getTrip: serviceMocks.getTrip, saveTrip: serviceMocks.saveTrip },
}));
vi.mock("@/services/investmentService", () => ({
	default: {
		getInvestment: serviceMocks.getInvestment,
		saveInvestment: serviceMocks.saveInvestment,
	},
}));
vi.mock("@/services/investmentTypeService", () => ({
	default: {
		getInvestmentTypes: serviceMocks.getInvestmentTypes,
		saveInvestmentType: serviceMocks.saveInvestmentType,
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
import CategoryFormScreen from "@/screens/CategoryFormScreen";
import InvestmentFormScreen from "@/screens/InvestmentFormScreen";
import NoteFormScreen from "@/screens/NoteFormScreen";
import SourceFormScreen from "@/screens/SourceFormScreen";
import TodoFormScreen from "@/screens/TodoFormScreen";
import TripFormScreen from "@/screens/TripFormScreen";
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
		Object.values(node.props).forEach((value) =>
			findByType(value, type, acc),
		);
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

	describe("finance forms", () => {
		const forms = [
			{
				name: "source",
				Screen: SourceFormScreen,
				load: "getSource",
				save: "createSource",
				savingIndex: 3,
				errorIndex: 4,
				values: { 2: "USD" },
			},
			{
				name: "category",
				Screen: CategoryFormScreen,
				load: "getCategory",
				save: "saveCategory",
				savingIndex: 4,
				errorIndex: 5,
				values: { 2: true, 3: true },
			},
			{
				name: "trip",
				Screen: TripFormScreen,
				load: "getTrip",
				save: "saveTrip",
				savingIndex: 2,
				errorIndex: 3,
				values: {},
			},
			{
				name: "investment",
				Screen: InvestmentFormScreen,
				load: "getInvestment",
				save: "saveInvestment",
				savingIndex: 5,
				errorIndex: 6,
				values: { 2: "Long term", 3: "type" },
			},
		] as const;
		const entity = {
			name: "Existing",
			currencyCode: "USD",
			isIncome: true,
			label: "Long term",
			investmentTypeId: "type",
		};
		const types = [
			{ id: "type", name: "Equity", createdAt: 1, updatedAt: 1 },
		];
		const findElement = <Props,>(
			tree: unknown,
			predicate: (props: Props) => boolean,
		): ReactElement<Props> => {
			const [element] = findByPredicate(
				tree,
				(node: unknown) =>
					isValidElement<Props>(node) && predicate(node.props),
			) as ReactElement<Props>[];
			if (!element) throw new Error("Expected form element");
			return element;
		};
		const setStateValues = (
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

		beforeEach(() => {
			vi.useFakeTimers();
			for (const form of forms) {
				serviceMocks[form.load].mockResolvedValue(entity);
				serviceMocks[form.save].mockResolvedValue("saved");
			}
			serviceMocks.updateSourceName.mockResolvedValue(undefined);
			serviceMocks.getInvestmentTypes.mockResolvedValue(types);
			serviceMocks.saveInvestmentType.mockResolvedValue("new-type");
		});
		afterEach(() => {
			vi.useRealTimers();
		});

		it.each(
			forms.flatMap((form) => [
				{ ...form, mode: "new", entityId: undefined },
				{ ...form, mode: "edit", entityId: "entity" },
			]),
		)(
			"loads and saves $mode $name forms before navigating back",
			async ({
				name,
				Screen,
				load,
				save,
				savingIndex,
				values,
				entityId,
			}) => {
				const setters = setStateValues({ 1: "Entered", ...values });
				const navigation = { goBack: vi.fn() };
				const tree = (Screen as (props: unknown) => ReactElement)({
					navigation,
					route: { params: entityId ? { entityId } : undefined },
				});
				await flush();
				if (entityId) {
					expect(serviceMocks[load]).toHaveBeenCalledWith(
						{ id: "db" },
						entityId,
					);
					expect(setters.get(1)).toHaveBeenCalledWith("Existing");
				} else expect(serviceMocks[load]).not.toHaveBeenCalled();
				if (name === "source")
					expect(
						findElement<
							Pick<TextFieldProps, "label" | "isEditable">
						>(tree, (props) => props.label === "Currency").props
							.isEditable,
					).toBe(!entityId);
				findElement<AppButtonProps>(
					tree,
					(props) => props.label === "Save",
				).props.onPress();
				await flush();
				expect(hookMocks.refreshData).toHaveBeenCalledOnce();
				expect(navigation.goBack).not.toHaveBeenCalled();
				await vi.runAllTimersAsync();
				expect(navigation.goBack).toHaveBeenCalledOnce();
				expect(setters.get(savingIndex)).toHaveBeenCalledWith(true);
				expect(setters.get(savingIndex)).toHaveBeenLastCalledWith(
					false,
				);
				const saveMock =
					name === "source" && entityId
						? serviceMocks.updateSourceName
						: serviceMocks[save];
				const argumentsByForm = {
					source: entityId
						? [entityId, "Entered"]
						: ["Entered", "USD"],
					category: [entityId, "Entered", true],
					trip: [entityId, "Entered"],
					investment: [entityId, "Entered", "Long term", "type"],
				};
				expect(saveMock).toHaveBeenCalledWith(
					{ id: "db" },
					...argumentsByForm[name],
				);
			},
		);

		it.each(forms)(
			"reports $name load/save failures and leaves the form open",
			async ({
				name,
				Screen,
				load,
				save,
				savingIndex,
				errorIndex,
				values,
			}) => {
				const setters = setStateValues({
					...values,
					[errorIndex]: "visible error",
				});
				serviceMocks[load].mockRejectedValueOnce(
					new Error("load failed"),
				);
				const saveMock =
					name === "source"
						? serviceMocks.updateSourceName
						: serviceMocks[save];
				saveMock.mockRejectedValueOnce(new Error("save failed"));
				const navigation = { goBack: vi.fn() };
				const tree = (Screen as (props: unknown) => ReactElement)({
					navigation,
					route: { params: { entityId: "entity" } },
				});
				await flush();
				expect(setters.get(errorIndex)).toHaveBeenCalledWith(
					"load failed",
				);
				expect(
					findElement<Pick<NoticeProps, "message">>(
						tree,
						(props) => props.message === "visible error",
					),
				).toBeDefined();
				findElement<AppButtonProps>(
					tree,
					(props) => props.label === "Save",
				).props.onPress();
				await flush();
				expect(setters.get(errorIndex)).toHaveBeenLastCalledWith(
					"save failed",
				);
				expect(setters.get(savingIndex)).toHaveBeenLastCalledWith(
					false,
				);
				expect(hookMocks.refreshData).not.toHaveBeenCalled();
				expect(navigation.goBack).not.toHaveBeenCalled();
			},
		);

		it.each(forms)(
			"handles a missing $name record",
			async ({ name, Screen, load }) => {
				const setters = setStateValues({});
				serviceMocks[load].mockResolvedValueOnce(null);
				(Screen as (props: unknown) => ReactElement)({
					navigation: { goBack: vi.fn() },
					route: { params: { entityId: "missing" } },
				});
				await flush();
				if (name === "source" || name === "category")
					expect(setters.get(1)).not.toHaveBeenCalled();
				else expect(setters.get(1)).toHaveBeenCalledWith("");
			},
		);

		it.each([true, false])(
			"confirms category classification changes to income=%s before saving",
			async (isIncome) => {
				const setters = setStateValues({
					1: "Category",
					2: isIncome,
					3: !isIncome,
				});
				const navigation = { goBack: vi.fn() };
				const tree = (
					CategoryFormScreen as (props: unknown) => ReactElement
				)({ navigation, route: { params: { entityId: "category" } } });
				await flush();
				findElement<AppButtonProps>(
					tree,
					(props) => props.label === "Save",
				).props.onPress();
				expect(serviceMocks.saveCategory).not.toHaveBeenCalled();
				expect(navigation.goBack).not.toHaveBeenCalled();
				const confirmation = hookMocks.confirm.mock
					.calls[0]?.[0] as Pick<
					AppDialogConfirmOptions,
					"title" | "onConfirm"
				>;
				expect(confirmation.title).toBe(
					"Change analysis classification?",
				);
				confirmation.onConfirm();
				await vi.runAllTimersAsync();
				expect(serviceMocks.saveCategory).toHaveBeenCalledWith(
					{ id: "db" },
					"category",
					"Category",
					isIncome,
				);
				expect(navigation.goBack).toHaveBeenCalledOnce();
				findElement<Required<Pick<SwitchProps, "onValueChange">>>(
					tree,
					(props) => typeof props.onValueChange === "function",
				).props.onValueChange?.(!isIncome);
				expect(setters.get(2)).toHaveBeenLastCalledWith(!isIncome);
			},
		);

		it("loads optional investment fields, creates types, and saves with no type", async () => {
			const setters = setStateValues({ 1: "Fund", 2: "", 3: "" });
			serviceMocks.getInvestment.mockResolvedValueOnce({
				name: "Fund",
				label: null,
				investmentTypeId: null,
			});
			const tree = (
				InvestmentFormScreen as (props: unknown) => ReactElement
			)({
				navigation: { goBack: vi.fn() },
				route: { params: { entityId: "fund" } },
			});
			await flush();
			expect(setters.get(2)).toHaveBeenCalledWith("");
			expect(setters.get(3)).toHaveBeenCalledWith("");
			expect(setters.get(4)).toHaveBeenCalledWith(types);
			const picker = findElement<
				Pick<InvestmentTypePickerProps, "onCreateInvestmentType">
			>(
				tree,
				(props) => typeof props.onCreateInvestmentType === "function",
			);
			await expect(
				picker.props.onCreateInvestmentType("New type"),
			).resolves.toBe("new-type");
			expect(serviceMocks.saveInvestmentType).toHaveBeenCalledWith(
				{ id: "db" },
				"New type",
			);
			expect(serviceMocks.getInvestmentTypes).toHaveBeenCalledTimes(2);
			findElement<AppButtonProps>(
				tree,
				(props) => props.label === "Save",
			).props.onPress();
			await vi.runAllTimersAsync();
			expect(serviceMocks.saveInvestment).toHaveBeenCalledWith(
				{ id: "db" },
				"fund",
				"Fund",
				"",
				null,
			);
		});
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
			(node) =>
				node?.props?.label === "Save entry" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		findByPredicate(
			passwordTree,
			(node) =>
				node?.props?.label === "Delete entry" &&
				typeof node?.props?.onPress === "function",
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
			(node) =>
				node?.props?.label === "Save entry" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		findByPredicate(
			cardTree,
			(node) =>
				node?.props?.label === "Delete entry" &&
				typeof node?.props?.onPress === "function",
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
			(node) =>
				node?.props?.label === "Save entry" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		findByPredicate(
			identityTree,
			(node) =>
				node?.props?.label === "Delete entry" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.getPassword).toHaveBeenCalledWith(
			{ id: "db" },
			"pw1",
		);
		expect(serviceMocks.savePassword).toHaveBeenCalled();
		expect(serviceMocks.deletePassword).toHaveBeenCalledWith(
			{ id: "db" },
			"pw1",
		);

		expect(serviceMocks.getCard).toHaveBeenCalledWith(
			{ id: "db" },
			"card1",
		);
		expect(serviceMocks.saveCard).toHaveBeenCalled();
		expect(serviceMocks.deleteCard).toHaveBeenCalledWith(
			{ id: "db" },
			"card1",
		);

		expect(serviceMocks.getIdentity).toHaveBeenCalledWith(
			{ id: "db" },
			"id1",
		);
		expect(serviceMocks.saveIdentity).toHaveBeenCalled();
		expect(serviceMocks.deleteIdentity).toHaveBeenCalledWith(
			{ id: "db" },
			"id1",
		);
		expect(hookMocks.processAttachment).toHaveBeenCalledWith("card1");
		expect(hookMocks.processAttachment).toHaveBeenCalledWith("id1");
	});

	it("covers VaultFormScreen error and callback wrapper branches", async () => {
		const navigation = { goBack: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => {
			onConfirm();
		});

		serviceMocks.getCard.mockRejectedValueOnce(
			new Error("load card failed"),
		);
		serviceMocks.saveCard.mockRejectedValueOnce(
			new Error("save card failed"),
		);
		serviceMocks.deleteCard.mockRejectedValueOnce(
			new Error("delete card failed"),
		);

		const setError = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 14) return ["", setError];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
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
			(node) =>
				node?.props?.label === "Card type" &&
				typeof node?.props?.onChange === "function",
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
			(node) =>
				node?.props?.label === "Save entry" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			cardTree,
			(node) =>
				node?.props?.label === "Delete entry" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(hookMocks.handleOpen).toHaveBeenCalled();
		expect(hookMocks.handlePick).toHaveBeenCalled();
		expect(hookMocks.handleRemove).toHaveBeenCalled();
		expect(setError).toHaveBeenCalledWith("save card failed");
		expect(setError).toHaveBeenCalledWith("delete card failed");
	});

	it("covers VaultFormScreen new PASSWORD branches and error notice render", async () => {
		const navigation = { goBack: vi.fn() };
		const setTitle = vi.fn();

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["", setTitle];
			if (stateCall === 14) return ["render error", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const passwordTree = VaultFormScreen({
			navigation,
			route: {
				key: "vault-password-new",
				name: "VaultForm",
				params: { kind: "PASSWORD" },
			},
		} as any);
		await flush();

		findByPredicate(
			passwordTree,
			(node) =>
				node?.props?.label === "Title" &&
				typeof node?.props?.onChangeText === "function",
		)[0]?.props?.onChangeText("Github");

		findByPredicate(
			passwordTree,
			(node) =>
				node?.props?.label === "Save entry" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(setTitle).toHaveBeenCalledWith("Github");
		expect(serviceMocks.savePassword).toHaveBeenCalledWith(
			{ id: "db" },
			{
				id: undefined,
				title: "",
				username: "",
				password: "",
				website: "",
				notes: "",
			},
		);
		expect(hookMocks.processAttachment).not.toHaveBeenCalledWith("pw1");
		expect(
			findByPredicate(
				passwordTree,
				(node) =>
					node?.props?.message === "render error" &&
					node?.props?.tone === "danger",
			),
		).not.toHaveLength(0);
		expect(
			findByPredicate(
				passwordTree,
				(node) =>
					typeof node?.props?.onOpen === "function" &&
					typeof node?.props?.onPick === "function",
			),
		).toHaveLength(0);
		expect(
			findByPredicate(
				passwordTree,
				(node) => node?.props?.label === "Delete entry",
			),
		).toHaveLength(0);
	});

	it("covers VaultFormScreen existing-entry null load branches", async () => {
		const navigation = { goBack: vi.fn() };
		serviceMocks.getPassword.mockResolvedValueOnce(null);
		serviceMocks.getCard.mockResolvedValueOnce(null);
		serviceMocks.getIdentity.mockResolvedValueOnce(null);

		const setTitle = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["", setTitle];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		VaultFormScreen({
			navigation,
			route: {
				key: "vault-password-null",
				name: "VaultForm",
				params: { kind: "PASSWORD", entryId: "pw1" },
			},
		} as any);
		await flush();

		stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["", setTitle];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		VaultFormScreen({
			navigation,
			route: {
				key: "vault-card-null",
				name: "VaultForm",
				params: { kind: "CARD", entryId: "card1" },
			},
		} as any);
		await flush();

		stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) return ["", setTitle];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		VaultFormScreen({
			navigation,
			route: {
				key: "vault-identity-null",
				name: "VaultForm",
				params: { kind: "IDENTITY", entryId: "id1" },
			},
		} as any);
		await flush();

		expect(setTitle).not.toHaveBeenCalled();
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
			(node) =>
				node?.props?.label === "Save budget" &&
				typeof node?.props?.onPress === "function",
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
		serviceMocks.getCategories.mockRejectedValueOnce(
			new Error("load failed"),
		);
		serviceMocks.saveBudget.mockRejectedValueOnce(new Error("save failed"));

		const tree = BudgetFormScreen({
			navigation,
			route: { key: "k-err", name: "BudgetForm", params: {} },
		} as any);
		await flush();

		const saveNode = findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Save budget" &&
				typeof node?.props?.onPress === "function",
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
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = BudgetFormScreen({
			navigation: { goBack: vi.fn() },
			route: { key: "k-render", name: "BudgetForm", params: {} },
		} as any);
		await flush();

		expect(
			findByPredicate(tree, (node) => node?.props?.message === "boom"),
		).not.toHaveLength(0);
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
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = BudgetFormScreen({
			navigation: { goBack: vi.fn() },
			route: { key: "k-period", name: "BudgetForm", params: {} },
		} as any);
		await flush();

		const select = findByPredicate(
			tree,
			(node) => node?.props?.label === "Expense category",
		)[0];
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
				node.props.options.some(
					(option: any) => option?.value === "MONTHLY",
				),
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
			(node) =>
				node?.props?.label === "Save note" &&
				typeof node?.props?.onPress === "function",
		)[0];
		saveNode?.props?.onPress();
		await flush();
		const deleteNode = findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Delete note" &&
				typeof node?.props?.onPress === "function",
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
		expect(serviceMocks.deleteNote).toHaveBeenCalledWith(
			{ id: "db" },
			"n1",
		);
		expect(navigation.goBack).toHaveBeenCalled();
	});

	it("covers NoteFormScreen new-note and save/delete error branches", async () => {
		const navigation = { goBack: vi.fn() };
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) => {
			onConfirm();
		});
		serviceMocks.getNote.mockRejectedValueOnce(new Error("load failed"));
		serviceMocks.saveNote.mockRejectedValueOnce(new Error("save failed"));
		serviceMocks.deleteNote.mockRejectedValueOnce(
			new Error("delete failed"),
		);

		const existingTree = NoteFormScreen({
			navigation,
			route: {
				key: "k-note-fail",
				name: "NoteForm",
				params: { noteId: "n1" },
			},
		} as any);
		await flush();

		findByPredicate(
			existingTree,
			(node) =>
				node?.props?.label === "Save note" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			existingTree,
			(node) =>
				node?.props?.label === "Delete note" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(navigation.goBack).not.toHaveBeenCalled();

		const newTree = NoteFormScreen({
			navigation: { goBack: vi.fn() },
			route: { key: "k-note-new", name: "NoteForm", params: {} },
		} as any);
		await flush();

		expect(
			findByPredicate(
				newTree,
				(node) => node?.props?.label === "Delete note",
			),
		).toHaveLength(0);
	});

	it("covers NoteFormScreen existing-note fallback branches", async () => {
		serviceMocks.getNote.mockResolvedValueOnce(null).mockResolvedValueOnce({
			id: "n1",
			title: "Loaded",
			content: "Body",
			folderId: undefined,
			hasAttachment: false,
			updatedAt: 1,
		});

		const firstTree = NoteFormScreen({
			navigation: { goBack: vi.fn() },
			route: {
				key: "k-note-null",
				name: "NoteForm",
				params: { noteId: "n1" },
			},
		} as any);
		await flush();

		const setFolderId = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return ["", vi.fn()];
			if (call === 2) return ["", vi.fn()];
			if (call === 3) return ["", setFolderId];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const secondTree = NoteFormScreen({
			navigation: { goBack: vi.fn() },
			route: {
				key: "k-note-undefined-folder",
				name: "NoteForm",
				params: { noteId: "n1" },
			},
		} as any);
		await flush();

		expect(firstTree).toBeTruthy();
		expect(secondTree).toBeTruthy();
		expect(setFolderId).toHaveBeenCalledWith("");
	});

	it("renders NoteFormScreen error notice branch", async () => {
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 5) return ["pre-existing error", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = NoteFormScreen({
			navigation: { goBack: vi.fn() },
			route: { key: "k-note-error", name: "NoteForm", params: {} },
		} as any);
		await flush();

		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.message === "pre-existing error",
			),
		).not.toHaveLength(0);
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
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TodoFormScreen({
			navigation,
			route: { key: "k", name: "TodoForm", params: { todoId: "t1" } },
		} as any);
		await flush();

		const dueNode = findByPredicate(
			tree,
			(node) => node?.props?.label === "Due",
		)[0];
		expect(dueNode).toBeTruthy();

		const saveNode = findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Save todo" &&
				typeof node?.props?.onPress === "function",
		)[0];
		saveNode?.props?.onPress();
		await flush();
		const deleteNode = findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Delete todo" &&
				typeof node?.props?.onPress === "function",
		)[0];
		deleteNode?.props?.onPress();
		await flush();

		expect(serviceMocks.getTodo).toHaveBeenCalledWith({ id: "db" }, "t1");
		expect(serviceMocks.saveTodo).toHaveBeenCalled();
		expect(serviceMocks.deleteTodo).toHaveBeenCalledWith(
			{ id: "db" },
			"t1",
		);
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
		serviceMocks.deleteTodo.mockRejectedValueOnce(
			new Error("delete failed"),
		);

		const existingTree = TodoFormScreen({
			navigation,
			route: {
				key: "k-todo-fail",
				name: "TodoForm",
				params: { todoId: "t1" },
			},
		} as any);
		await flush();

		findByPredicate(
			existingTree,
			(node) =>
				node?.props?.label === "Save todo" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			existingTree,
			(node) =>
				node?.props?.label === "Delete todo" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(navigation.goBack).not.toHaveBeenCalled();

		const newTree = TodoFormScreen({
			navigation: { goBack: vi.fn() },
			route: { key: "k-todo-new", name: "TodoForm", params: {} },
		} as any);
		await flush();

		expect(
			findByPredicate(
				newTree,
				(node) => node?.props?.label === "Delete todo",
			),
		).toHaveLength(0);
	});

	it("covers TodoFormScreen existing-todo fallback branches", async () => {
		serviceMocks.getTodo.mockResolvedValueOnce(null).mockResolvedValueOnce({
			id: "t1",
			title: "Todo",
			description: "Desc",
			folderId: undefined,
			hasAttachment: false,
			isDone: false,
			dueAt: null,
			updatedAt: 1,
		});

		const firstTree = TodoFormScreen({
			navigation: { goBack: vi.fn() },
			route: {
				key: "k-todo-null",
				name: "TodoForm",
				params: { todoId: "t1" },
			},
		} as any);
		await flush();

		const setFolderId = vi.fn();
		const setDueAt = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return ["", vi.fn()];
			if (call === 2) return ["", vi.fn()];
			if (call === 3) return ["", setFolderId];
			if (call === 6) return [Date.now(), setDueAt];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const secondTree = TodoFormScreen({
			navigation: { goBack: vi.fn() },
			route: {
				key: "k-todo-fallbacks",
				name: "TodoForm",
				params: { todoId: "t1" },
			},
		} as any);
		await flush();

		expect(firstTree).toBeTruthy();
		expect(secondTree).toBeTruthy();
		expect(setFolderId).toHaveBeenCalledWith("");
		expect(setDueAt).toHaveBeenCalled();
	});

	it("renders TodoFormScreen error notice branch", async () => {
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 8) return ["pre-existing todo error", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TodoFormScreen({
			navigation: { goBack: vi.fn() },
			route: { key: "k-todo-error", name: "TodoForm", params: {} },
		} as any);
		await flush();

		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.message === "pre-existing todo error",
			),
		).not.toHaveLength(0);
	});
});
