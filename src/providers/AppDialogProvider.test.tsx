import { beforeEach, describe, expect, it, vi } from "vitest";

const setActiveDialog = vi.hoisted(() => vi.fn());

const reactMocks = vi.hoisted(() => ({
	useState: vi.fn(),
	useCallback: vi.fn((fn: any) => fn),
	useMemo: vi.fn((factory: () => unknown) => factory()),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useState: reactMocks.useState,
		useCallback: reactMocks.useCallback,
		useMemo: reactMocks.useMemo,
	};
});

vi.mock("@expo/vector-icons", () => ({
	Ionicons: (props: any) => ({ type: "Ionicons", props }),
}));

vi.mock("react-native", () => ({
	Modal: (props: any) => ({ type: "Modal", props }),
	Pressable: (props: any) => ({ type: "Pressable", props }),
	StyleSheet: {
		create: (styles: any) => styles,
		absoluteFill: {},
	},
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("@/components/AppButton", () => ({
	default: (props: any) => ({ type: "AppButton", props }),
}));

vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));

vi.mock("@/components/GlassCard", () => ({
	default: (props: any) => ({ type: "GlassCard", props }),
}));

vi.mock("@/providers/AppDialogContext", () => ({
	default: {
		Provider: ({ value, children }: any) => ({ type: "Provider", props: { value, children } }),
	},
}));

import AppDialogProvider from "@/providers/AppDialogProvider";

const setupState = (activeDialog: any): void => {
	reactMocks.useState.mockReset();
	reactMocks.useState.mockImplementationOnce(() => [activeDialog, setActiveDialog]);
};

const collectNodesByType = (node: any, type: string, acc: any[] = []): any[] => {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((child) => collectNodesByType(child, type, acc));
		return acc;
	}
	if (node.type === type) {
		acc.push(node);
	}
	if (node.props) {
		Object.values(node.props).forEach((value) => collectNodesByType(value, type, acc));
	}
	return acc;
};

const collectNodesByPredicate = (
	node: any,
	predicate: (candidate: any) => boolean,
	acc: any[] = [],
): any[] => {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((child) => collectNodesByPredicate(child, predicate, acc));
		return acc;
	}
	if (predicate(node)) {
		acc.push(node);
	}
	if (node.props) {
		Object.values(node.props).forEach((value) =>
			collectNodesByPredicate(value, predicate, acc),
		);
	}
	return acc;
};

describe("AppDialogProvider", () => {
	beforeEach(() => {
		setActiveDialog.mockClear();
		reactMocks.useCallback.mockClear();
		reactMocks.useMemo.mockClear();
	});

	it("exposes context actions that set dialog modes", () => {
		setupState(null);
		const element = AppDialogProvider({ children: null } as any) as any;
		const contextValue = element.props.value;

		contextValue.confirm({
			title: "Delete",
			message: "Confirm",
			confirmLabel: "Delete",
			onConfirm: vi.fn(),
			variant: "danger",
		});
		expect(setActiveDialog).toHaveBeenCalledWith(
			expect.objectContaining({ mode: "CONFIRM" }),
		);

		contextValue.showMessage({
			title: "Done",
			message: "Saved",
			variant: "success",
		});
		expect(setActiveDialog).toHaveBeenCalledWith(
			expect.objectContaining({ mode: "MESSAGE" }),
		);
	});

	it("renders confirm branch", () => {
		const onConfirm = vi.fn();
		setupState({
			mode: "CONFIRM",
			options: {
				title: "Delete",
				message: "Confirm delete",
				confirmLabel: "Delete",
				cancelLabel: "Cancel",
				onConfirm,
				variant: "danger",
			},
		});

		const element = AppDialogProvider({ children: null } as any) as any;
		const modalNodes = collectNodesByPredicate(
			element,
			(node) => Boolean(node?.props?.onRequestClose),
		);
		expect(modalNodes.length).toBeGreaterThan(0);
		modalNodes[0]?.props.onRequestClose();
		expect(setActiveDialog).toHaveBeenCalledWith(null);

		const actionButtons = collectNodesByPredicate(
			element,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				typeof node?.props?.label === "string",
		);
		const confirmButton = actionButtons.find(
			(node) => node?.props?.label === "Delete",
		);
		expect(confirmButton).toBeTruthy();
		confirmButton?.props.onPress();
		expect(setActiveDialog).toHaveBeenCalledWith(null);
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("renders message branch", () => {
		setupState({
			mode: "MESSAGE",
			options: {
				title: "Info",
				message: "Hello",
				variant: "success",
			},
		});

		const element = AppDialogProvider({ children: null } as any) as any;
		const textNodes = collectNodesByPredicate(
			element,
			(node) => node?.props?.children === "Info",
		);
		expect(textNodes.length).toBeGreaterThan(0);
	});

	it("uses default close action and closes from scrim press", () => {
		setupState({
			mode: "MESSAGE",
			options: {
				title: "Heads up",
				message: "Default action",
			},
		});

		const element = AppDialogProvider({ children: null } as any) as any;
		const closeButton = collectNodesByPredicate(
			element,
			(node) =>
				node?.props?.label === "Close" &&
				typeof node?.props?.onPress === "function",
		)[0];
		expect(closeButton).toBeTruthy();
		closeButton?.props.onPress();

		expect(setActiveDialog).toHaveBeenCalledWith(null);
		expect(setActiveDialog).toHaveBeenCalledTimes(1);
	});

	it("uses default cancel label and primary confirm variant", () => {
		setupState({
			mode: "CONFIRM",
			options: {
				title: "Archive",
				message: "Proceed?",
				confirmLabel: "Yes",
				onConfirm: vi.fn(),
			},
		});

		const element = AppDialogProvider({ children: null } as any) as any;
		const cancelButton = collectNodesByPredicate(
			element,
			(node) =>
				node?.props?.label === "Cancel" &&
				node?.props?.variant === "secondary",
		)[0];
		expect(cancelButton).toBeTruthy();

		const confirmButton = collectNodesByPredicate(
			element,
			(node) =>
				node?.props?.label === "Yes" &&
				node?.props?.variant === "primary",
		)[0];
		expect(confirmButton).toBeTruthy();
	});
});
