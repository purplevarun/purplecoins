import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useMemo: reactMocks.useMemo,
		useState: reactMocks.useState,
	};
});

vi.mock("react-native", () => ({
	ActivityIndicator: "ActivityIndicator",
	Modal: "Modal",
	Pressable: "Pressable",
	ScrollView: "ScrollView",
	StyleSheet: {
		create: (styles: unknown) => styles,
	},
	View: "View",
}));

vi.mock("@expo/vector-icons", () => ({
	Ionicons: "Ionicons",
}));

vi.mock("@/components/CustomText", () => ({
	default: "CustomText",
}));

vi.mock("@/components/CustomTextInput", () => ({
	default: "CustomTextInput",
}));

import AppButton from "@/components/AppButton";
import SegmentedControl from "@/components/SegmentedControl";
import SelectField from "@/components/SelectField";
import TextField from "@/components/TextField";

const findAllByType = (node: any, type: string, acc: any[] = []): any[] => {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((child) => findAllByType(child, type, acc));
		return acc;
	}
	if (node.type === type) {
		acc.push(node);
	}
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
				(textNode) => textNode?.props?.children,
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

describe("form components", () => {
	beforeEach(() => {
		reactMocks.useState.mockReset();
		reactMocks.useMemo.mockClear();
	});

	it("covers AppButton variants and loading/disabled/pressed branches", () => {
		const onPress = vi.fn();
		const variants = ["primary", "secondary", "success", "danger"] as const;

		for (const variant of variants) {
			const button = AppButton({
				label: "Save",
				onPress,
				variant,
				icon: "checkmark",
			} as any);
			expect(button.type).toBe("Pressable");
			expect(button.props.style({ pressed: false })[1]).toBe(false);
			expect(button.props.style({ pressed: true })[1]).toBeTruthy();
		}

		const loadingButton = AppButton({
			label: "Save",
			onPress,
			isLoading: true,
			isCompact: true,
			isDisabled: true,
		} as any);
		expect(loadingButton.props.disabled).toBe(true);
		expect(findAllByType(loadingButton, "ActivityIndicator").length).toBe(
			1,
		);
		expect(loadingButton.props.style({ pressed: true })[1]).toBe(false);

		const noIconButton = AppButton({
			label: "No Icon",
			onPress,
			variant: "primary",
		} as any);
		expect(findAllByType(noIconButton, "Ionicons")).toHaveLength(0);
	});

	it("covers SegmentedControl basis math and selected state", () => {
		const onChange = vi.fn();
		const segmented = SegmentedControl({
			value: "a",
			onChange,
			options: [
				{ label: "A", value: "a" },
				{ label: "B", value: "b" },
				{ label: "C", value: "c" },
				{ label: "D", value: "d" },
			],
		} as any);

		const pressables = findAllByType(segmented, "Pressable");
		expect(pressables).toHaveLength(4);
		expect(pressables[0]?.props.style[1].flexBasis).toContain("%");
		pressables[1]?.props.onPress();
		expect(onChange).toHaveBeenCalledWith("b");
	});

	it("covers TextField secure and non-secure branches", () => {
		const setShowSecret = vi.fn();
		reactMocks.useState.mockImplementationOnce(() => [
			false,
			setShowSecret,
		]);
		const onChangeText = vi.fn();

		const secureField = TextField({
			label: "Password",
			value: "topsecret",
			onChangeText,
			placeholder: "Enter",
			isSecure: true,
			isMultiline: true,
			isEditable: false,
		} as any);

		const secureInput = findAllByType(secureField, "CustomTextInput")[0];
		expect(secureInput.props.secureTextEntry).toBe(true);
		expect(secureInput.props.multiline).toBe(true);
		expect(secureInput.props.editable).toBe(false);

		const eyeButton = findAllByType(secureField, "Pressable")[0];
		eyeButton.props.onPress();
		expect(setShowSecret).toHaveBeenCalledWith(expect.any(Function));
		const toggleSecret = setShowSecret.mock.calls[0]?.[0] as (
			current: boolean,
		) => boolean;
		expect(toggleSecret(false)).toBe(true);
		expect(toggleSecret(true)).toBe(false);
		expect(findAllByType(secureField, "Ionicons")[0]?.props.name).toBe(
			"eye-outline",
		);

		reactMocks.useState.mockImplementationOnce(() => [true, vi.fn()]);
		const revealedField = TextField({
			label: "Password",
			value: "topsecret",
			onChangeText,
			isSecure: true,
		} as any);
		expect(findAllByType(revealedField, "Ionicons")[0]?.props.name).toBe(
			"eye-off-outline",
		);

		reactMocks.useState.mockImplementationOnce(() => [false, vi.fn()]);
		const plainField = TextField({
			label: "Name",
			value: "Alice",
			onChangeText,
			isSecure: false,
		} as any);
		expect(findAllByType(plainField, "Pressable")).toHaveLength(0);
	});

	it("covers SelectField open/close/select/search/no-result branches", () => {
		const setIsOpen = vi.fn();
		const setSearch = vi.fn();
		const onChange = vi.fn();
		const options = [
			{ label: "Cash Wallet", value: "cash", description: "Daily" },
			{ label: "Bank", value: "bank" },
		];

		reactMocks.useState
			.mockImplementationOnce(() => [false, setIsOpen])
			.mockImplementationOnce(() => ["", setSearch]);
		const closed = SelectField({
			label: "Source",
			value: "cash",
			options,
			onChange,
			isOptional: false,
		} as any);
		const closedPressables = findAllByType(closed, "Pressable");
		closedPressables[0]?.props.onPress();
		expect(setSearch).toHaveBeenCalledWith("");
		expect(setIsOpen).toHaveBeenCalledWith(true);

		reactMocks.useState
			.mockImplementationOnce(() => [true, setIsOpen])
			.mockImplementationOnce(() => ["zz", setSearch]);
		const openNoResults = SelectField({
			label: "Source",
			value: "",
			options,
			onChange,
			isOptional: true,
		} as any);

		const modal = findAllByType(openNoResults, "Modal")[0];
		expect(modal.props.visible).toBe(true);
		modal.props.onRequestClose();
		expect(setIsOpen).toHaveBeenCalledWith(false);

		const optionPressables = findAllByType(openNoResults, "Pressable");
		expect(optionPressables.length).toBeGreaterThan(0);
		const overlayPressable = optionPressables.find(
			(node) =>
				node?.props?.style?.backgroundColor === "rgba(0,0,0,0.72)",
		);
		expect(overlayPressable).toBeTruthy();
		overlayPressable?.props?.onPress();
		expect(setIsOpen).toHaveBeenCalledWith(false);

		const noneOption = findPressableByText(modal, "None");
		expect(noneOption).toBeTruthy();
		noneOption.props.onPress();
		expect(onChange).toHaveBeenCalledWith("");
		expect(setIsOpen).toHaveBeenCalledWith(false);

		reactMocks.useState
			.mockImplementationOnce(() => [true, setIsOpen])
			.mockImplementationOnce(() => ["cash", setSearch]);
		const openMatch = SelectField({
			label: "Source",
			value: "cash",
			options,
			onChange,
			isOptional: false,
		} as any);
		const openMatchModal = findAllByType(openMatch, "Modal")[0];
		const cashOption = findPressableByText(openMatchModal, "Cash Wallet");
		expect(cashOption).toBeTruthy();
		cashOption.props.onPress();
		expect(onChange).toHaveBeenCalledWith("cash");
		expect(setSearch).toHaveBeenCalledWith("");
	});
});
