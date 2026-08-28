import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useState: vi.fn(),
}));

const transactionServiceMocks = vi.hoisted(() => ({
	getTransactionDisplayReason: vi.fn(() => "Display reason"),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useState: reactMocks.useState,
	};
});

vi.mock("react-native", () => ({
	Modal: "Modal",
	Pressable: "Pressable",
	ScrollView: "ScrollView",
	StyleSheet: { create: (styles: unknown) => styles },
	View: "View",
}));

vi.mock("@expo/vector-icons", () => ({
	Ionicons: "Ionicons",
}));

vi.mock("react-native-svg", () => ({
	default: "Svg",
	Circle: "Circle",
}));

vi.mock("@/components/CustomText", () => ({ default: "CustomText" }));
vi.mock("@/components/CustomTextInput", () => ({ default: "CustomTextInput" }));
vi.mock("@/components/AppButton", () => ({ default: "AppButton" }));
vi.mock("@/components/GlassCard", () => ({ default: "GlassCard" }));

vi.mock("@/services/transactionService", () => ({
	default: transactionServiceMocks,
}));

vi.mock("@/utils/date", () => ({
	default: {
		formatDate: vi.fn(() => "2026-08-25"),
	},
}));

vi.mock("@/utils/money", () => ({
	default: {
		formatMoney: vi.fn(
			(amount: string, currencyCode: string) =>
				`${currencyCode}:${amount}`,
		),
	},
}));

import DonutChart from "@/components/DonutChart";
import FolderFilterChips from "@/components/FolderFilterChips";
import TransactionCard from "@/components/TransactionCard";

const findAllByType = (node: any, type: string, acc: any[] = []): any[] => {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((child) => findAllByType(child, type, acc));
		return acc;
	}
	if (node.type === type) acc.push(node);
	if (node.props) {
		Object.values(node.props).forEach((value) =>
			findAllByType(value, type, acc),
		);
	}
	return acc;
};

const findPressableByText = (node: any, text: string): any => {
	const pressables = findAllByType(node, "Pressable");
	const matches = pressables
		.filter((pressable) => typeof pressable?.props?.onPress === "function")
		.map((pressable) => {
			const labels = findAllByType(pressable, "CustomText").map(
				(textNode) => String(textNode?.props?.children ?? ""),
			);
			return {
				pressable,
				labels,
				labelCount: labels.length,
			};
		})
		.filter((entry) => entry.labels.includes(text))
		.sort((a, b) => a.labelCount - b.labelCount);

	return matches[0]?.pressable;
};

const hasTextContaining = (node: any, value: string): boolean =>
	findAllByType(node, "CustomText").some((textNode) => {
		const children = textNode?.props?.children;
		if (Array.isArray(children)) {
			return children
				.map((part) => String(part))
				.join("")
				.includes(value);
		}
		return String(children ?? "").includes(value);
	});

const findAppButtonByLabel = (node: any, label: string): any =>
	findAllByType(node, "AppButton").find(
		(button) => button?.props?.label === label,
	);

const baseTransaction = {
	id: "t1",
	classification: "GENERAL",
	type: "DEBIT",
	sourceId: "s1",
	destinationSourceId: null,
	amount: "100",
	toAmount: null,
	categoryId: "c1",
	tripId: null,
	investmentId: null,
	reason: "",
	transactionAt: 123,
	createdAt: 123,
	updatedAt: 123,
	sourceName: "Cash",
	sourceCurrencyCode: "INR",
	destinationSourceName: null,
	destinationCurrencyCode: null,
	categoryName: "Groceries",
	tripName: null,
	investmentName: null,
	hasAttachment: false,
};

describe("advanced components", () => {
	beforeEach(() => {
		reactMocks.useState.mockReset();
		transactionServiceMocks.getTransactionDisplayReason.mockClear();
	});

	it("covers DonutChart total and legend behavior", () => {
		const chartWithData = DonutChart({
			centerLabel: "INR 100",
			data: [
				{ label: "A", value: 10, color: "#111" },
				{ label: "B", value: 20, color: "#222" },
				{ label: "C", value: 30, color: "#333" },
				{ label: "D", value: 40, color: "#444" },
				{ label: "E", value: 50, color: "#555" },
				{ label: "F", value: 60, color: "#666" },
				{ label: "G", value: 70, color: "#777" },
			],
		} as any);
		expect(findAllByType(chartWithData, "Circle")).toHaveLength(8);
		const legendRows = findAllByType(chartWithData, "View").filter(
			(view) => view?.props?.style?.gap === 8,
		);
		expect(legendRows.length).toBeGreaterThan(0);

		const chartWithoutData = DonutChart({
			centerLabel: "INR 0",
			data: [{ label: "A", value: 0, color: "#111" }],
		} as any);
		expect(findAllByType(chartWithoutData, "Circle")).toHaveLength(1);
	});

	it("covers TransactionCard icon/meta/amount branches", () => {
		const onPress = vi.fn();
		const onLongPress = vi.fn();

		const credit = TransactionCard({
			transaction: {
				...baseTransaction,
				type: "CREDIT",
				hasAttachment: true,
			},
			onPress,
			onLongPress,
		} as any);
		expect(
			findAllByType(credit, "Ionicons").some(
				(icon) => icon.props.name === "arrow-down",
			),
		).toBe(true);
		expect(
			findAllByType(credit, "Ionicons").some(
				(icon) => icon.props.name === "attach",
			),
		).toBe(true);
		expect(hasTextContaining(credit, "+INR:100")).toBe(true);

		const debitInvestment = TransactionCard({
			transaction: {
				...baseTransaction,
				classification: "INVESTMENT",
				investmentName: "Mutual Fund",
				type: "DEBIT",
				tripName: "Trip A",
			},
			onPress,
		} as any);
		expect(
			findAllByType(debitInvestment, "Ionicons").some(
				(icon) => icon.props.name === "arrow-up",
			),
		).toBe(true);
		expect(
			findAllByType(debitInvestment, "CustomText").some(
				(text) => text.props.children === "Mutual Fund",
			),
		).toBe(true);
		expect(hasTextContaining(debitInvestment, "-INR:100")).toBe(true);

		const transfer = TransactionCard({
			transaction: {
				...baseTransaction,
				type: "TRANSFER",
				destinationSourceName: "Bank",
				destinationCurrencyCode: "USD",
				toAmount: "2",
			},
			onPress,
		} as any);
		expect(
			findAllByType(transfer, "Ionicons").some(
				(icon) => icon.props.name === "swap-horizontal",
			),
		).toBe(true);
		expect(hasTextContaining(transfer, "-> USD:2")).toBe(true);

			const transferWithoutDestinationName = TransactionCard({
				transaction: {
					...baseTransaction,
					type: "TRANSFER",
					destinationSourceName: null,
					destinationCurrencyCode: null,
					toAmount: null,
				},
				onPress,
			} as any);
			expect(hasTextContaining(transferWithoutDestinationName, "Cash -> ")).toBe(true);

			const debitWithoutCategory = TransactionCard({
				transaction: {
					...baseTransaction,
					type: "DEBIT",
					classification: "GENERAL",
					categoryName: null,
				},
				onPress,
			} as any);
			expect(hasTextContaining(debitWithoutCategory, "Cash · ")).toBe(true);
	});

	it("covers FolderFilterChips selection and action flows", async () => {
		const setActionFolder = vi.fn();
		const setRenameMode = vi.fn();
		const setRenameName = vi.fn();
		const folder = {
			id: "f1",
			name: "Work",
			type: "NOTE",
			createdAt: 1,
			updatedAt: 1,
		};
		const onSelectFolder = vi.fn();
		const onDeleteFolder = vi.fn();
		const onRenameFolder = vi.fn();

		reactMocks.useState
			.mockImplementationOnce(() => [null, setActionFolder])
			.mockImplementationOnce(() => [false, setRenameMode])
			.mockImplementationOnce(() => ["", setRenameName]);
		const closed = FolderFilterChips({
			folders: [folder],
			selectedFolderId: "",
			onSelectFolder,
			onDeleteFolder,
			onRenameFolder,
		} as any);

		const closedPressables = findAllByType(closed, "Pressable");
		closedPressables[0]?.props.onPress();
		expect(onSelectFolder).toHaveBeenCalledWith("__ALL_FOLDERS__");
		closedPressables[2]?.props.onPress();
		expect(onSelectFolder).toHaveBeenCalledWith("f1");
		closedPressables[2]?.props.onLongPress();
		expect(setActionFolder).toHaveBeenCalledWith(folder);
		expect(setRenameMode).toHaveBeenCalledWith(false);
		expect(setRenameName).toHaveBeenCalledWith("Work");

		reactMocks.useState
			.mockImplementationOnce(() => [folder, setActionFolder])
			.mockImplementationOnce(() => [false, setRenameMode])
			.mockImplementationOnce(() => ["Work", setRenameName]);
		const actionSheet = FolderFilterChips({
			folders: [folder],
			selectedFolderId: "f1",
			onSelectFolder,
			onDeleteFolder,
			onRenameFolder,
		} as any);
		const modal = findAllByType(actionSheet, "Modal")[0];
		expect(modal.props.visible).toBe(true);

		const renamePressable = findPressableByText(modal, "Rename");
		expect(renamePressable).toBeTruthy();
		renamePressable.props.onPress();
		expect(setRenameMode).toHaveBeenCalledWith(true);

		const deletePressable = findPressableByText(modal, "Delete");
		expect(deletePressable).toBeTruthy();
		deletePressable.props.onPress();
		expect(onDeleteFolder).toHaveBeenCalledWith(folder);
		expect(setActionFolder).toHaveBeenCalledWith(null);
		expect(setRenameMode).toHaveBeenCalledWith(false);
		expect(setRenameName).toHaveBeenCalledWith("");

		reactMocks.useState
			.mockImplementationOnce(() => [folder, setActionFolder])
			.mockImplementationOnce(() => [true, setRenameMode])
			.mockImplementationOnce(() => ["  Office  ", setRenameName]);
		const renameModeTree = FolderFilterChips({
			folders: [folder],
			selectedFolderId: "f1",
			onSelectFolder,
			onDeleteFolder,
			onRenameFolder,
		} as any);

		const saveButton = findAppButtonByLabel(renameModeTree, "Save");
		expect(saveButton).toBeTruthy();
		saveButton.props.onPress();
		expect(onRenameFolder).toHaveBeenCalledWith(folder, "Office");

		reactMocks.useState
			.mockImplementationOnce(() => [folder, setActionFolder])
			.mockImplementationOnce(() => [true, setRenameMode])
			.mockImplementationOnce(() => ["   ", setRenameName]);
		const blankRenameTree = FolderFilterChips({
			folders: [folder],
			selectedFolderId: "f1",
			onSelectFolder,
			onDeleteFolder,
			onRenameFolder,
		} as any);
		const saveButtonBlank = findAppButtonByLabel(blankRenameTree, "Save");
		saveButtonBlank.props.onPress();
		expect(onRenameFolder).toHaveBeenCalledTimes(1);
	});

	it("hides folder action affordances when rename/delete callbacks are absent", () => {
		const setActionFolder = vi.fn();
		const setRenameMode = vi.fn();
		const setRenameName = vi.fn();
		const folder = {
			id: "f2",
			name: "Personal",
			type: "NOTE",
			createdAt: 1,
			updatedAt: 1,
		};

		reactMocks.useState
			.mockImplementationOnce(() => [folder, setActionFolder])
			.mockImplementationOnce(() => [false, setRenameMode])
			.mockImplementationOnce(() => ["Personal", setRenameName]);

		const tree = FolderFilterChips({
			folders: [folder],
			selectedFolderId: "f2",
			onSelectFolder: vi.fn(),
		} as any);

		const ellipsisIcons = findAllByType(tree, "Ionicons").filter(
			(icon) => icon?.props?.name === "ellipsis-vertical",
		);
		expect(ellipsisIcons).toHaveLength(0);

		const modal = findAllByType(tree, "Modal")[0];
		expect(modal?.props?.visible).toBe(true);
		expect(findPressableByText(modal, "Rename")).toBeFalsy();
		expect(findPressableByText(modal, "Delete")).toBeFalsy();
	});

	it("applies selected styles for the static All chip", () => {
		reactMocks.useState
			.mockImplementationOnce(() => [null, vi.fn()])
			.mockImplementationOnce(() => [false, vi.fn()])
			.mockImplementationOnce(() => ["", vi.fn()]);

		const tree = FolderFilterChips({
			folders: [],
			selectedFolderId: "__ALL_FOLDERS__",
			onSelectFolder: vi.fn(),
		} as any);

		const allChip = findPressableByText(tree, "All");
		expect(allChip).toBeTruthy();
		expect(Array.isArray(allChip.props.style)).toBe(true);
		expect(allChip.props.style[1]).toBeTruthy();
	});
});
