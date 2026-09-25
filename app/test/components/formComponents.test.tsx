import type AppButtonProps from "@/types/AppButtonProps";
import type NoticeProps from "@/types/NoticeProps";
import type SelectFieldProps from "@/types/SelectFieldProps";
import { isValidElement, type ReactElement } from "react";
import type { TextProps } from "react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react")>();
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
import PlatformPicker from "@/components/PlatformPicker";
import SegmentedControl from "@/components/SegmentedControl";
import SelectField from "@/components/SelectField";
import SimpleEntityForm from "@/components/SimpleEntityForm";
import TextField from "@/components/TextField";

const findElement = <Props,>(
	tree: unknown,
	predicate: (props: Props) => boolean,
): ReactElement<Props> => {
	const visit = (node: unknown): ReactElement<Props> | undefined => {
		if (Array.isArray(node)) {
			for (const child of node) {
				const found = visit(child);
				if (found) return found;
			}
		} else if (isValidElement<Props>(node)) {
			if (predicate(node.props)) return node;
			return visit(Object.values(node.props as object));
		}
		return undefined;
	};
	const found = visit(tree);
	if (!found) throw new Error("Expected form element");
	return found;
};

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
	it.each([true, false])(
		"does not submit a relation twice while saving=%s",
		async (saving) => {
			reactMocks.useState
				.mockReturnValueOnce(["Name", vi.fn()])
				.mockReturnValueOnce([saving, vi.fn()])
				.mockReturnValueOnce(["", vi.fn()]);
			const onSave = vi.fn().mockResolvedValue(undefined);
			await findElement<AppButtonProps>(
				SimpleEntityForm({ onSave }),
				(props) => props.label === "Save",
			).props.onPress();
			expect(onSave).toHaveBeenCalledTimes(saving ? 0 : 1);
		},
	);

	it("keeps the selected archived platform while hiding other archived platforms", () => {
		const platform = {
			id: "selected",
			name: "Broker",
			archived: 1,
			createdAt: 1,
			updatedAt: 1,
		};
		const tree = PlatformPicker({
			platforms: [platform, { ...platform, id: "hidden" }],
			value: "selected",
			placeholder: "Choose",
			onValueChange: vi.fn(),
		});
		expect(
			findElement<SelectFieldProps>(
				tree,
				(props) => props.label === "Platform",
			).props.options,
		).toEqual([{ label: "Broker", value: "selected" }]);
	});
	it("shows relation save failures without clearing the entered name", async () => {
		const setName = vi.fn();
		const setSaving = vi.fn();
		const setError = vi.fn();
		reactMocks.useState
			.mockReturnValueOnce(["Broker", setName])
			.mockReturnValueOnce([false, setSaving])
			.mockReturnValueOnce(["Save failed", setError]);
		const onSave = vi.fn().mockRejectedValue(new Error("Save failed"));
		const tree = SimpleEntityForm({ onSave });
		expect(
			findElement<NoticeProps>(
				tree,
				(props) => props.message === "Save failed",
			).props.tone,
		).toBe("danger");
		await findElement<AppButtonProps>(
			tree,
			(props) => props.label === "Save",
		).props.onPress();
		expect(onSave).toHaveBeenCalledWith("Broker");
		expect(setError).toHaveBeenLastCalledWith("Save failed");
		expect(setSaving).toHaveBeenLastCalledWith(false);
		expect(setName).not.toHaveBeenCalled();
	});

	it("connects the platform selector to the SelectField change callback", () => {
		const onValueChange = vi.fn();
		const tree = PlatformPicker({
			platforms: [
				{ id: "platform", name: "Broker", createdAt: 1, updatedAt: 1 },
			],
			onValueChange,
		});
		const field = findElement<SelectFieldProps>(
			tree,
			(props) => props.label === "Platform",
		).props;
		expect(field.value).toBe("");
		expect(field.options).toEqual([{ label: "Broker", value: "platform" }]);
		field.onChange("platform");
		expect(onValueChange).toHaveBeenLastCalledWith("platform");
		field.onChange("");
		expect(onValueChange).toHaveBeenLastCalledWith(null);
	});

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
		});
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
		});

		const pressables = findAllByType(segmented, "Pressable");
		expect(pressables).toHaveLength(4);
		expect(pressables[0]?.props.style[1].flexBasis).toContain("%");
		pressables[1]?.props.onPress();
		expect(onChange).toHaveBeenCalledWith("b");
		const labels = findAllByType(
			segmented,
			"CustomText",
		) as ReactElement<TextProps>[];
		for (const label of labels) {
			expect(label.props.numberOfLines).toBe(1);
		}
	});

	it("allows SegmentedControl labels to wrap when requested", () => {
		const segmented = SegmentedControl({
			value: "PENDING_VALIDATION",
			onChange: vi.fn(),
			labelNumberOfLines: 2,
			options: [
				{ label: "All", value: "ALL" },
				{ label: "Validated", value: "VALIDATED" },
				{ label: "Pending Validation", value: "PENDING_VALIDATION" },
			],
		});
		const labels = findAllByType(
			segmented,
			"CustomText",
		) as ReactElement<TextProps>[];
		expect(labels.map((label) => label.props.numberOfLines)).toEqual([
			2, 2, 2,
		]);
		expect(labels[2]?.props.style).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ textAlign: "center" }),
			]),
		);
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
		});

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
		});
		expect(findAllByType(revealedField, "Ionicons")[0]?.props.name).toBe(
			"eye-off-outline",
		);

		reactMocks.useState.mockImplementationOnce(() => [false, vi.fn()]);
		const plainField = TextField({
			label: "Name",
			value: "Alice",
			onChangeText,
			isSecure: false,
		});
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
		});
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
		});

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
		});
		const openMatchModal = findAllByType(openMatch, "Modal")[0];
		const cashOption = findPressableByText(openMatchModal, "Cash Wallet");
		expect(cashOption).toBeTruthy();
		cashOption.props.onPress();
		expect(onChange).toHaveBeenCalledWith("cash");
		expect(setSearch).toHaveBeenCalledWith("");
	});
});
