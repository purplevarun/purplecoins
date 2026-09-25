import AppButton from "@/components/AppButton";
import DateField from "@/components/DateField";
import HeaderIconButton from "@/components/HeaderIconButton";
import SegmentedControl from "@/components/SegmentedControl";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";
import type AppDialogConfirmOptions from "@/types/AppDialogConfirmOptions";
import type AttachmentInput from "@/types/AttachmentInput";
import type AttachmentTestState from "@test/types/AttachmentTestState";
import type TransactionFormHarness from "@test/types/TransactionFormHarness";
import { isValidElement, type ComponentProps, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useEffect: vi.fn(),
	useState: vi.fn(),
	useRef: vi.fn(() => ({ current: false })),
}));

const serviceMocks = vi.hoisted(() => ({
	getCategories: vi.fn(),
	getInvestments: vi.fn(),
	getDefaultSourceId: vi.fn(),
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

const attachmentState = vi.hoisted((): AttachmentTestState => ({
	pendingAttachment: null,
	isRemoved: false,
}));
const sharingMocks = vi.hoisted(() => ({
	isAvailableAsync: vi.fn(),
	shareAsync: vi.fn(),
}));
vi.mock("expo-sharing", () => sharingMocks);

vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react")>();
	return {
		...actual,
		useEffect: reactMocks.useEffect,
		useState: reactMocks.useState,
		useRef: reactMocks.useRef,
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

vi.mock("@/components/HeaderIconButton", () => ({
	default: (props: unknown) => ({ type: "HeaderIconButton", props }),
}));
vi.mock("@/utils/id", () => {
	let nextId = 0;
	return { default: () => `draft-${nextId++}` };
});
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
		isRemoved: attachmentState.isRemoved,
		pendingAttachment: attachmentState.pendingAttachment,
		processAttachment: hookMocks.processAttachment,
		handleOpen: hookMocks.handleOpen,
		handlePick: hookMocks.handlePick,
		handleRemove: hookMocks.handleRemove,
	}),
}));
vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({
		database: { id: "db" },
		refreshData: hookMocks.refreshData,
	}),
}));

vi.mock("@/services/categoryService", () => ({
	default: { getCategories: serviceMocks.getCategories },
}));
vi.mock("@/services/investmentService", () => ({
	default: { getInvestments: serviceMocks.getInvestments },
}));
vi.mock("@/services/settingsService", () => ({
	default: {
		getDefaultSourceId: serviceMocks.getDefaultSourceId,
		getDefaultTripId: serviceMocks.getDefaultTripId,
	},
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

const formElements = <Props,>(
	tree: ReactElement,
	component: unknown,
): ReactElement<Props>[] =>
	findByPredicate(
		tree,
		(node: unknown) =>
			isValidElement<Props>(node) && node.type === component,
	) as ReactElement<Props>[];

const createFormHarness = (
	overrides: ReadonlyMap<number, unknown> = new Map(),
	params: Record<string, string | undefined> = {},
): TransactionFormHarness => {
	const values = new Map<number, unknown>([
		[3, "s1"],
		[11, 100],
		[12, [{ id: "s1", name: "Bank", currencyCode: "INR", balance: "0" }]],
		[
			13,
			[
				{ id: "food", name: "Food", isIncome: false },
				{ id: "grocery", name: "Grocery", isIncome: false },
			],
		],
		...overrides,
	]);
	const navigation = { goBack: vi.fn() };
	const saving = { current: false };
	let stateIndex = 0;
	reactMocks.useRef.mockReturnValue(saving);
	reactMocks.useEffect.mockImplementation(() => undefined);
	reactMocks.useState.mockImplementation((initial: unknown) => {
		const index = ++stateIndex;
		if (!values.has(index))
			values.set(
				index,
				typeof initial === "function"
					? (initial as () => unknown)()
					: initial,
			);
		return [
			values.get(index),
			(value: unknown) =>
				values.set(
					index,
					typeof value === "function"
						? (value as (current: unknown) => unknown)(
								values.get(index),
							)
						: value,
				),
		];
	});
	return {
		values,
		navigation,
		render: () => {
			stateIndex = 0;
			const renderScreen = TransactionFormScreen as (
				props: unknown,
			) => ReactElement;
			return renderScreen({
				navigation,
				route: { key: "items", name: "TransactionForm", params },
			});
		},
	};
};

describe("TransactionFormScreen", () => {
	it.each([true, false])(
		"shares a returned attachment URI when available=%s",
		async (available) => {
			hookMocks.handleOpen.mockResolvedValue("file://preview");
			sharingMocks.isAvailableAsync.mockResolvedValue(available);
			sharingMocks.shareAsync.mockClear();
			const tree = TransactionFormScreen({
				navigation: { goBack: vi.fn() },
				route: { params: undefined },
			} as any);
			const field = findByPredicate(
				tree,
				(node) => typeof node?.props?.onOpen === "function",
			)[0];
			await field.props.onOpen();
			expect(sharingMocks.shareAsync).toHaveBeenCalledTimes(
				available ? 1 : 0,
			);
		},
	);
	beforeEach(() => {
		attachmentState.pendingAttachment = null;
		attachmentState.isRemoved = false;
		reactMocks.useEffect.mockReset();
		reactMocks.useState.mockReset();
		reactMocks.useRef.mockImplementation(() => ({ current: false }));
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
		serviceMocks.getCategories.mockResolvedValue([
			{ id: "c1", name: "Food", isIncome: false },
		]);
		serviceMocks.getTrips.mockResolvedValue([{ id: "tr1", name: "Goa" }]);
		serviceMocks.getInvestments.mockResolvedValue([
			{ id: "i1", name: "MF" },
		]);
		serviceMocks.getDefaultSourceId.mockResolvedValue(null);
		serviceMocks.getDefaultTripId.mockResolvedValue("tr1");
		serviceMocks.getTransaction.mockResolvedValue(null);
		serviceMocks.saveTransaction.mockResolvedValue("txSaved");
		serviceMocks.deleteTransaction.mockResolvedValue(undefined);
		hookMocks.processAttachment.mockResolvedValue(undefined);
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);
	});

	it("starts with one item, adds independent fields, and never removes the last item", async () => {
		const harness = createFormHarness();
		let tree = harness.render();
		expect(formElements(tree, HeaderIconButton)).toHaveLength(0);
		formElements<ComponentProps<typeof TextField>>(tree, TextField)
			.find((field) => field.props.keyboardType === "decimal-pad")
			?.props.onChangeText("100");
		formElements<ComponentProps<typeof SelectField>>(tree, SelectField)
			.find((field) => field.props.label === "Category")
			?.props.onChange("food");
		formElements<ComponentProps<typeof AppButton>>(tree, AppButton)
			.find((button) => button.props.label === "Add item")
			?.props.onPress();
		tree = harness.render();
		const amounts = formElements<ComponentProps<typeof TextField>>(
			tree,
			TextField,
		).filter((field) => field.props.keyboardType === "decimal-pad");
		expect(amounts.map((field) => field.props.value)).toEqual(["100", ""]);
		amounts[1]?.props.onChangeText("100");
		formElements<ComponentProps<typeof SelectField>>(tree, SelectField)
			.filter((field) => field.props.label === "Category")[1]
			?.props.onChange("grocery");
		tree = harness.render();
		formElements<ComponentProps<typeof AppButton>>(tree, AppButton)
			.find((button) => button.props.label === "Save transaction")
			?.props.onPress();
		await flush();
		expect(serviceMocks.saveTransaction).toHaveBeenCalledWith(
			{ id: "db" },
			expect.objectContaining({
				amount: "200",
				categoryId: undefined,
				sourceId: "s1",
				transactionAt: 100,
				items: [
					{ id: undefined, amount: "100", categoryId: "food" },
					{ id: undefined, amount: "100", categoryId: "grocery" },
				],
			}),
			undefined,
		);
		formElements<ComponentProps<typeof HeaderIconButton>>(
			tree,
			HeaderIconButton,
		)[0]?.props.onPress();
		tree = harness.render();
		expect(formElements(tree, HeaderIconButton)).toHaveLength(0);
		expect(
			formElements<ComponentProps<typeof TextField>>(
				tree,
				TextField,
			).filter((field) => field.props.keyboardType === "decimal-pad"),
		).toHaveLength(1);
	});

	it("keeps split drafts when a mode change is canceled and carries the total on confirmation", () => {
		const harness = createFormHarness(
			new Map([
				[
					18,
					[
						{ key: "one", amount: "0.1", categoryId: "food" },
						{ key: "two", amount: "0.2", categoryId: "grocery" },
					],
				],
			]),
		);
		hookMocks.confirm.mockImplementation(() => undefined);
		const tree = harness.render();
		formElements<ComponentProps<typeof SegmentedControl>>(
			tree,
			SegmentedControl,
		)[1]?.props.onChange("CREDIT");
		expect(hookMocks.confirm).toHaveBeenCalledOnce();
		expect(harness.values.get(2)).toBe("DEBIT");
		expect(harness.values.get(18)).toHaveLength(2);
		const confirmation = hookMocks.confirm.mock.calls[0]?.[0] as Pick<
			AppDialogConfirmOptions,
			"onConfirm"
		>;
		confirmation.onConfirm();
		expect(harness.values.get(2)).toBe("CREDIT");
		expect(harness.values.get(5)).toBe("0.3");
		const incomeTree = harness.render();
		expect(
			formElements<ComponentProps<typeof AppButton>>(
				incomeTree,
				AppButton,
			).some((button) => button.props.label === "Add item"),
		).toBe(false);
		formElements<ComponentProps<typeof SegmentedControl>>(
			incomeTree,
			SegmentedControl,
		)[1]?.props.onChange("DEBIT");
		expect(harness.values.get(18)).toMatchObject([
			{ amount: "0.3", categoryId: "food" },
		]);
	});

	it.each([false, true])(
		"loads all expense items and preserves IDs only when editing (clone=%s)",
		async (clone) => {
			const params = clone
				? { cloneFromTransactionId: "payment" }
				: { transactionId: "payment" };
			const harness = createFormHarness(new Map(), params);
			serviceMocks.getTransaction.mockResolvedValue({
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: "s1",
				amount: "200",
				reason: "Supermart",
				transactionAt: 42,
				items: [
					{
						id: "one",
						categoryId: "food",
						categoryName: "Food",
						amount: "100",
					},
					{
						id: "two",
						categoryId: "archived",
						categoryName: "Old category",
						amount: "100",
					},
				],
			});
			reactMocks.useEffect.mockImplementation((effect: () => void) =>
				effect(),
			);
			harness.render();
			await flush();
			reactMocks.useEffect.mockImplementation(() => undefined);
			const tree = harness.render();
			expect(harness.values.get(18)).toMatchObject([
				{ id: clone ? undefined : "one", amount: "100" },
				{ id: clone ? undefined : "two", amount: "100" },
			]);
			expect(harness.values.get(11)).toBe(clone ? 100 : 42);
			const categories = formElements<ComponentProps<typeof SelectField>>(
				tree,
				SelectField,
			).filter((field) => field.props.label === "Category");
			expect(categories[1]?.props.options).toContainEqual({
				label: "Old category",
				value: "archived",
			});
			formElements<ComponentProps<typeof AppButton>>(tree, AppButton)
				.find((button) => button.props.label === "Save transaction")
				?.props.onPress();
			await flush();
			expect(serviceMocks.saveTransaction).toHaveBeenCalledWith(
				{ id: "db" },
				expect.objectContaining({
					id: clone ? undefined : "payment",
					amount: "200",
				}),
				undefined,
			);
		},
	);

	it("prevents duplicate saves until the payment commits", async () => {
		const harness = createFormHarness();
		let completeSave: (value: string) => void = () => undefined;
		serviceMocks.saveTransaction.mockReturnValue(
			new Promise<string>((resolve) => {
				completeSave = resolve;
			}),
		);
		const tree = harness.render();
		const button = formElements<ComponentProps<typeof AppButton>>(
			tree,
			AppButton,
		).find((candidate) => candidate.props.label === "Save transaction");
		button?.props.onPress();
		button?.props.onPress();
		expect(serviceMocks.saveTransaction).toHaveBeenCalledOnce();
		expect(harness.navigation.goBack).not.toHaveBeenCalled();
		const savingTree = harness.render();
		expect(
			findByPredicate(
				savingTree,
				(node: unknown) =>
					isValidElement<
						ComponentProps<typeof import("react-native").View>
					>(node) && node.props.pointerEvents === "none",
			),
		).toHaveLength(1);
		completeSave("payment");
		await flush();
		expect(harness.navigation.goBack).toHaveBeenCalledOnce();
		expect(harness.values.get(16)).toBe(false);
	});

	it.each(["replace", "remove"])(
		"sends a shared receipt %s through the payment save",
		async (change) => {
			const receipt: AttachmentInput = {
				fileName: "receipt.txt",
				mimeType: "text/plain",
				sizeBytes: 1,
				content: new Uint8Array([1]),
			};
			attachmentState.pendingAttachment =
				change === "replace" ? receipt : null;
			attachmentState.isRemoved = change === "remove";
			const harness = createFormHarness(
				new Map([
					[2, "CREDIT"],
					[5, "100"],
					[7, "food"],
				]),
			);
			const tree = harness.render();
			formElements<ComponentProps<typeof AppButton>>(tree, AppButton)
				.find((button) => button.props.label === "Save transaction")
				?.props.onPress();
			await flush();
			expect(serviceMocks.saveTransaction).toHaveBeenCalledWith(
				{ id: "db" },
				expect.objectContaining({
					type: "CREDIT",
					categoryId: "food",
					items: undefined,
					amount: "100",
				}),
				change === "replace" ? receipt : null,
			);
		},
	);

	it("keeps incomplete item totals unavailable and can change mode without inventing an amount", () => {
		const harness = createFormHarness(
			new Map([
				[
					18,
					[
						{ key: "one", amount: "", categoryId: "" },
						{ key: "two", amount: "1", categoryId: "food" },
					],
				],
			]),
		);
		const tree = harness.render();
		formElements<ComponentProps<typeof SegmentedControl>>(
			tree,
			SegmentedControl,
		)[1]?.props.onChange("CREDIT");
		expect(harness.values.get(5)).toBe("");
		harness.values.set(1, "GENERAL");
		harness.values.set(2, "DEBIT");
		harness.values.set(18, []);
		formElements<ComponentProps<typeof SegmentedControl>>(
			harness.render(),
			SegmentedControl,
		)[1]?.props.onChange("CREDIT");
		expect(harness.values.get(7)).toBe("");
	});

	it("shows a decimal total before selecting a source", () => {
		const harness = createFormHarness(
			new Map<number, unknown>([
				[3, ""],
				[
					18,
					[
						{ key: "one", amount: "0.1", categoryId: "food" },
						{ key: "two", amount: "0.2", categoryId: "grocery" },
					],
				],
			]),
		);
		const tree = harness.render();
		expect(
			findByPredicate(
				tree,
				(node: unknown) =>
					isValidElement<
						ComponentProps<
							typeof import("@/components/CustomText").default
						>
					>(node) && node.props.children === "0.3",
			),
		).toHaveLength(1);
	});

	it.each([
		{
			context: "source",
			params: { initialSourceId: "s2" },
			defaultSource: "s1",
			sourceId: "s2",
			categoryId: "",
		},
		{
			context: "category",
			params: { initialCategoryId: "c1" },
			defaultSource: "s1",
			sourceId: "s1",
			categoryId: "c1",
		},
		{
			context: "saved default source",
			params: undefined,
			defaultSource: "s1",
			sourceId: "s1",
			categoryId: "",
		},
		{
			context: "unavailable default source",
			params: undefined,
			defaultSource: "missing-source",
			sourceId: "",
			categoryId: "",
		},
		{
			context: "no linked entity",
			params: undefined,
			defaultSource: null,
			sourceId: "",
			categoryId: "",
		},
	])(
		"prefills a new transaction from $context and retains the default trip",
		async ({ params, defaultSource, sourceId, categoryId }) => {
			serviceMocks.getDefaultSourceId.mockResolvedValue(defaultSource);
			const setSourceId = vi.fn();
			const setCategoryId = vi.fn();
			const setTripId = vi.fn();
			let stateCall = 0;
			reactMocks.useState.mockImplementation((initial: unknown) => {
				stateCall += 1;
				if (stateCall === 3) return ["", setSourceId];
				if (stateCall === 7) return ["", setCategoryId];
				if (stateCall === 8) return ["", setTripId];
				return [
					typeof initial === "function"
						? (initial as () => unknown)()
						: initial,
					vi.fn(),
				];
			});
			const renderScreen = TransactionFormScreen as (
				props: unknown,
			) => ReactElement;
			renderScreen({
				navigation: { goBack: vi.fn() },
				route: { key: "new", name: "TransactionForm", params },
			});
			await flush();

			expect(setSourceId).toHaveBeenCalledExactlyOnceWith(sourceId);
			expect(setCategoryId).toHaveBeenCalledExactlyOnceWith(categoryId);
			expect(setTripId).toHaveBeenCalledExactlyOnceWith("tr1");
			expect(
				serviceMocks.getDefaultSourceId,
			).toHaveBeenCalledExactlyOnceWith({ id: "db" });
			expect(serviceMocks.getTransaction).not.toHaveBeenCalled();
		},
	);

	it("saves the prefilled source, linked category, and default trip", async () => {
		serviceMocks.getDefaultSourceId.mockResolvedValue("s1");
		const stateValues = new Map<number, unknown>([
			[18, [{ key: "first", amount: "15", categoryId: "c1" }]],
		]);
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: unknown) => {
			stateCall += 1;
			const stateIndex = stateCall;
			if (!stateValues.has(stateIndex)) {
				stateValues.set(
					stateIndex,
					typeof initial === "function"
						? (initial as () => unknown)()
						: initial,
				);
			}
			return [
				stateValues.get(stateIndex),
				vi.fn((value: unknown) => {
					stateValues.set(stateIndex, value);
				}),
			];
		});
		const navigation = { goBack: vi.fn() };
		const props = {
			navigation,
			route: {
				key: "prefilled",
				name: "TransactionForm",
				params: { initialCategoryId: "c1" },
			},
		};
		const renderScreen = TransactionFormScreen as (
			props: unknown,
		) => ReactElement;
		renderScreen(props);
		await flush();
		reactMocks.useEffect.mockImplementation(() => undefined);
		stateCall = 0;
		const tree = renderScreen(props);
		const [saveButton] = findByPredicate(
			tree,
			(node: unknown) =>
				isValidElement<ComponentProps<typeof AppButton>>(node) &&
				node.type === AppButton &&
				node.props.label === "Save transaction",
		) as ReactElement<ComponentProps<typeof AppButton>>[];
		expect(saveButton?.props.isDisabled).toBe(false);
		saveButton?.props.onPress();
		await flush();

		expect(serviceMocks.saveTransaction).toHaveBeenCalledWith(
			{ id: "db" },
			expect.objectContaining({
				sourceId: "s1",
				categoryId: undefined,
				items: [{ id: undefined, amount: "15", categoryId: "c1" }],
				tripId: "tr1",
				amount: "15",
			}),
			undefined,
		);
		expect(navigation.goBack).toHaveBeenCalled();
	});

	it.each([
		{
			day: "August 24",
			initialTransactionAt: new Date(2026, 7, 24, 14, 30).getTime(),
		},
		{ day: "today", initialTransactionAt: new Date().getTime() },
		{ day: "the Unix epoch", initialTransactionAt: 0 },
	])(
		"prefills and saves $day supplied by the transaction list",
		async ({ initialTransactionAt }) => {
			const navigation = { goBack: vi.fn() };
			const setTransactionAt = vi.fn();
			let stateCall = 0;
			reactMocks.useState.mockImplementation((initial: unknown) => {
				stateCall += 1;
				if (stateCall === 3) return ["s1", vi.fn()];
				if (stateCall === 5) return ["15", vi.fn()];
				if (stateCall === 7) return ["c1", vi.fn()];
				if (stateCall === 10) return ["Lunch", vi.fn()];
				return [
					typeof initial === "function"
						? (initial as () => unknown)()
						: initial,
					stateCall === 11 ? setTransactionAt : vi.fn(),
				];
			});
			const renderScreen = TransactionFormScreen as (
				props: unknown,
			) => ReactElement;
			const tree = renderScreen({
				navigation,
				route: {
					key: "new-transaction",
					name: "TransactionForm",
					params: { initialTransactionAt },
				},
			});
			await flush();
			const [dateField] = findByPredicate(
				tree,
				(node: unknown) =>
					isValidElement(node) && node.type === DateField,
			) as ReactElement<ComponentProps<typeof DateField>>[];
			expect(dateField?.props.value).toBe(initialTransactionAt);
			expect(setTransactionAt).not.toHaveBeenCalled();

			const [saveButton] = findByPredicate(
				tree,
				(node: unknown) =>
					isValidElement<ComponentProps<typeof AppButton>>(node) &&
					node.type === AppButton &&
					node.props.label === "Save transaction",
			) as ReactElement<ComponentProps<typeof AppButton>>[];
			saveButton?.props.onPress();
			await flush();
			expect(serviceMocks.saveTransaction).toHaveBeenCalledWith(
				{ id: "db" },
				expect.objectContaining({
					transactionAt: initialTransactionAt,
				}),
				undefined,
			);
			expect(navigation.goBack).toHaveBeenCalled();
		},
	);

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
				return [
					[
						{
							id: "s1",
							name: "Cash",
							currencyCode: "INR",
							balance: "0",
						},
						{
							id: "s2",
							name: "Bank",
							currencyCode: "INR",
							balance: "0",
						},
					],
					vi.fn(),
				];
			if (stateCall === 13)
				return [[{ id: "c1", name: "Food", isIncome: false }], vi.fn()];
			if (stateCall === 14)
				return [[{ id: "tr1", name: "Goa" }], vi.fn()];
			if (stateCall === 15) return [[{ id: "i1", name: "MF" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: {
				key: "k",
				name: "TransactionForm",
				params: { transactionId: "tx1" },
			},
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Save transaction" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Delete transaction" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.saveTransaction).toHaveBeenCalledWith(
			{ id: "db" },
			{
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
				items: undefined,
			},
			undefined,
		);
		expect(hookMocks.processAttachment).not.toHaveBeenCalled();
		expect(serviceMocks.deleteTransaction).toHaveBeenCalledWith(
			{ id: "db" },
			"tx1",
		);
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
				return [
					[
						{
							id: "s1",
							name: "Cash",
							currencyCode: "INR",
							balance: "0",
						},
					],
					vi.fn(),
				];
			if (stateCall === 13)
				return [[{ id: "c1", name: "Food", isIncome: false }], vi.fn()];
			if (stateCall === 14)
				return [[{ id: "tr1", name: "Goa" }], vi.fn()];
			if (stateCall === 15) return [[{ id: "i1", name: "MF" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k2", name: "TransactionForm", params: {} },
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Save transaction" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.saveTransaction).toHaveBeenCalledWith(
			{ id: "db" },
			{
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
				items: undefined,
			},
			undefined,
		);
		expect(hookMocks.processAttachment).not.toHaveBeenCalled();
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
				(node) =>
					node?.props?.message ===
					"Create a source before adding transactions.",
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
		serviceMocks.saveTransaction.mockRejectedValueOnce(
			new Error("save failed"),
		);
		serviceMocks.deleteTransaction.mockRejectedValueOnce(
			new Error("delete failed"),
		);

		const tree = TransactionFormScreen({
			navigation,
			route: {
				key: "k5",
				name: "TransactionForm",
				params: { transactionId: "tx1" },
			},
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Save transaction" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Delete transaction" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.saveTransaction).toHaveBeenCalled();
		expect(serviceMocks.deleteTransaction).toHaveBeenCalledWith(
			{ id: "db" },
			"tx1",
		);
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
			items: [
				{
					id: "item",
					amount: "77",
					categoryId: "c1",
					categoryName: "Food",
				},
			],
		});

		const setTransactionAt = vi.fn();
		const setSourceId = vi.fn();
		const setCategoryId = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 3) return ["", setSourceId];
			if (stateCall === 7) return ["", setCategoryId];
			if (stateCall === 11) return [111, setTransactionAt];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		TransactionFormScreen({
			navigation,
			route: {
				key: "k6",
				name: "TransactionForm",
				params: {
					transactionId: "tx1",
					initialSourceId: "s2",
					initialCategoryId: "other-category",
				},
			},
		} as any);
		await flush();
		await flush();

		expect(setTransactionAt).toHaveBeenCalledWith(12345);
		expect(setSourceId).toHaveBeenCalledExactlyOnceWith("s1");
		expect(setCategoryId).toHaveBeenCalledExactlyOnceWith("c1");
		expect(serviceMocks.getDefaultSourceId).not.toHaveBeenCalled();
		expect(serviceMocks.getDefaultTripId).not.toHaveBeenCalled();
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
			items: [
				{
					id: "item",
					amount: "77",
					categoryId: "c1",
					categoryName: "Food",
				},
			],
		});

		const setTransactionAt = vi.fn();
		const setSourceId = vi.fn();
		const setCategoryId = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 3) return ["", setSourceId];
			if (stateCall === 7) return ["", setCategoryId];
			if (stateCall === 11) return [111, setTransactionAt];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		TransactionFormScreen({
			navigation,
			route: {
				key: "k7",
				name: "TransactionForm",
				params: {
					cloneFromTransactionId: "tx1",
					initialSourceId: "s2",
					initialCategoryId: "other-category",
				},
			},
		} as any);
		await flush();
		await flush();

		expect(setTransactionAt).not.toHaveBeenCalled();
		expect(setSourceId).toHaveBeenCalledExactlyOnceWith("s1");
		expect(setCategoryId).toHaveBeenCalledExactlyOnceWith("c1");
		expect(serviceMocks.getDefaultSourceId).not.toHaveBeenCalled();
		expect(serviceMocks.getDefaultTripId).not.toHaveBeenCalled();
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
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k8", name: "TransactionForm", params: {} },
		} as any);
		await flush();

		const segmentedControls = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onChange === "function" &&
				Array.isArray(node?.props?.options),
		);
		segmentedControls[0]?.props?.onChange("INVESTMENT");
		segmentedControls[0]?.props?.onChange("GENERAL");
		segmentedControls[1]?.props?.onChange("CREDIT");
		segmentedControls[1]?.props?.onChange("SOMETHING_ELSE");

		expect(setClassification).toHaveBeenCalledWith("INVESTMENT");
		expect(setClassification).toHaveBeenCalledWith("GENERAL");
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
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
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
			if (stateCall === 18)
				return [
					[{ key: "first", amount: "300", categoryId: "c1" }],
					vi.fn(),
				];
			if (stateCall === 12)
				return [
					[
						{
							id: "s1",
							name: "Cash",
							currencyCode: "INR",
							balance: "0",
						},
					],
					vi.fn(),
				];
			if (stateCall === 13)
				return [[{ id: "c1", name: "Food", isIncome: false }], vi.fn()];
			if (stateCall === 14)
				return [[{ id: "tr1", name: "Goa" }], vi.fn()];
			if (stateCall === 15) return [[{ id: "i1", name: "MF" }], vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k9", name: "TransactionForm", params: {} },
		} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Save transaction" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(serviceMocks.saveTransaction).toHaveBeenCalledWith(
			{ id: "db" },
			{
				id: undefined,
				classification: "GENERAL",
				type: "DEBIT",
				sourceId: "s1",
				destinationSourceId: undefined,
				amount: "300",
				toAmount: undefined,
				categoryId: undefined,
				items: [{ id: undefined, categoryId: "c1", amount: "300" }],
				tripId: "tr1",
				investmentId: undefined,
				reason: "Groceries",
				transactionAt: 789,
			},
			undefined,
		);
	});

	it("maps category options with income and expense descriptions", async () => {
		const navigation = { goBack: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 13) {
				return [
					[
						{ id: "c1", name: "Salary", isIncome: true },
						{ id: "c2", name: "Food", isIncome: false },
					],
					vi.fn(),
				];
			}
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: { key: "k11", name: "TransactionForm", params: {} },
		} as any);

		const categorySelect = findByPredicate(
			tree,
			(node) =>
				node?.props?.placeholder === "Select category" &&
				Array.isArray(node?.props?.options),
		)[0];
		expect(categorySelect?.props?.options).toEqual([
			{ label: "Salary", value: "c1", description: "Income" },
			{ label: "Food", value: "c2", description: "Expense" },
		]);
	});

	it("covers existing-transaction null fallbacks and error notice rendering", async () => {
		const navigation = { goBack: vi.fn() };
		serviceMocks.getTransaction.mockResolvedValueOnce({
			id: "tx2",
			classification: "GENERAL",
			type: "DEBIT",
			sourceId: "s1",
			destinationSourceId: null,
			amount: "11",
			toAmount: null,
			categoryId: null,
			tripId: null,
			investmentId: null,
			reason: "R",
			transactionAt: 200,
			items: [
				{
					id: "item",
					categoryId: "c1",
					amount: "11",
					categoryName: "Food",
				},
			],
		});

		const setCategoryId = vi.fn();
		const setTripId = vi.fn();
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 7) return ["", setCategoryId];
			if (stateCall === 8) return ["", setTripId];
			if (stateCall === 17) return ["boom", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionFormScreen({
			navigation,
			route: {
				key: "k12",
				name: "TransactionForm",
				params: { transactionId: "tx2" },
			},
		} as any);
		await flush();
		await flush();

		expect(setCategoryId).toHaveBeenCalledWith("");
		expect(setTripId).toHaveBeenCalledWith("");
		expect(
			findByPredicate(
				tree,
				(node) =>
					node?.props?.message === "boom" &&
					node?.props?.tone === "danger",
			),
		).not.toHaveLength(0);
	});
});
