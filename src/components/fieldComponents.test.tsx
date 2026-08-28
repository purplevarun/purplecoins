import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useState: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useState: reactMocks.useState,
	};
});

vi.mock("react-native", () => ({
	Platform: { OS: "ios" },
	Pressable: "Pressable",
	StyleSheet: { create: (styles: unknown) => styles },
	View: "View",
}));

vi.mock("@expo/vector-icons", () => ({
	Ionicons: "Ionicons",
}));

vi.mock("@react-native-community/datetimepicker", () => ({
	default: "DateTimePicker",
}));

vi.mock("@/components/CustomText", () => ({
	default: "CustomText",
}));
vi.mock("@/components/AppButton", () => ({
	default: "AppButton",
}));
vi.mock("@/components/SelectField", () => ({
	default: "SelectField",
}));
vi.mock("@/components/TextField", () => ({
	default: "TextField",
}));

vi.mock("@/utils/date", () => ({
	default: {
		formatDate: vi.fn(() => "2026-08-25"),
	},
}));

import AttachmentField from "@/components/AttachmentField";
import DateField from "@/components/DateField";
import FolderPicker from "@/components/FolderPicker";

import { Platform } from "react-native";

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

describe("field components", () => {
	beforeEach(() => {
		reactMocks.useState.mockReset();
	});

	it("covers AttachmentField choose/open/remove branches", () => {
		const handlers = {
			onPick: vi.fn(),
			onOpen: vi.fn(),
			onRemove: vi.fn(),
		};

		const empty = AttachmentField({
			existingAttachment: null,
			pendingAttachment: null,
			isRemoved: false,
			...handlers,
		} as any);
		const emptyButtons = findAllByType(empty, "AppButton");
		expect(emptyButtons).toHaveLength(1);
		expect(emptyButtons[0]?.props.label).toBe("Choose document");

		const existing = AttachmentField({
			existingAttachment: {
				id: "a1",
				ownerId: "n1",
				ownerType: "NOTE",
				fileName: "doc.pdf",
				sizeBytes: 1100,
				mimeType: "application/pdf",
				createdAt: 1,
				updatedAt: 1,
			},
			pendingAttachment: null,
			isRemoved: false,
			...handlers,
		} as any);
		const existingButtons = findAllByType(existing, "AppButton");
		expect(existingButtons.map((button) => button.props.label)).toEqual([
			"Open",
			"Remove",
		]);

		const pending = AttachmentField({
			existingAttachment: {
				id: "a1",
				ownerId: "n1",
				ownerType: "NOTE",
				fileName: "old.pdf",
				sizeBytes: 1100,
				mimeType: "application/pdf",
				createdAt: 1,
				updatedAt: 1,
			},
			pendingAttachment: {
				fileName: "new.bin",
				mimeType: "application/octet-stream",
				sizeBytes: 2 * 1024 * 1024,
				content: new Uint8Array([1]),
			},
			isRemoved: false,
			...handlers,
		} as any);
		const pendingButtons = findAllByType(pending, "AppButton");
		expect(pendingButtons.map((button) => button.props.label)).toEqual([
			"Remove",
		]);
	});

	it("covers DateField picker visibility and platform behavior", () => {
		const setVisible = vi.fn();
		reactMocks.useState.mockImplementationOnce(() => [false, setVisible]);
		const onChange = vi.fn();

		const closed = DateField({
			label: "Date",
			value: 1_000,
			onChange,
		} as any);
		expect(findAllByType(closed, "DateTimePicker")).toHaveLength(0);
		const trigger = findAllByType(closed, "Pressable")[0];
		trigger.props.onPress();
		expect(setVisible).toHaveBeenCalledWith(true);

		(Platform as { OS: string }).OS = "ios";
		reactMocks.useState.mockImplementationOnce(() => [true, setVisible]);
		const openIos = DateField({
			label: "Date",
			value: 1_000,
			onChange,
		} as any);
		const pickerIos = findAllByType(openIos, "DateTimePicker")[0];
		expect(pickerIos.props.display).toBe("inline");
		pickerIos.props.onDismiss();
		expect(setVisible).toHaveBeenCalledWith(false);
		pickerIos.props.onValueChange({}, new Date(2_000));
		expect(onChange).toHaveBeenCalledWith(2_000);

		(Platform as { OS: string }).OS = "android";
		reactMocks.useState.mockImplementationOnce(() => [true, setVisible]);
		const openAndroid = DateField({
			label: "Date",
			value: 1_000,
			onChange,
		} as any);
		const pickerAndroid = findAllByType(openAndroid, "DateTimePicker")[0];
		expect(pickerAndroid.props.display).toBe("default");
		pickerAndroid.props.onValueChange({}, new Date(3_000));
		expect(onChange).toHaveBeenCalledWith(3_000);
		expect(setVisible).toHaveBeenCalledWith(false);
	});

	it("covers FolderPicker create and non-create states", async () => {
		const setCreating = vi.fn();
		const setFolderName = vi.fn();
		reactMocks.useState
			.mockImplementationOnce(() => [false, setCreating])
			.mockImplementationOnce(() => ["", setFolderName]);

		const onChange = vi.fn();
		const onCreateFolder = vi.fn(async () => "folder-123");
		const closed = FolderPicker({
			value: "",
			folders: [
				{
					id: "f1",
					name: "Work",
					type: "NOTE",
					createdAt: 1,
					updatedAt: 1,
				},
			],
			onChange,
			onCreateFolder,
		} as any);
		const closedButtons = findAllByType(closed, "AppButton");
		expect(closedButtons).toHaveLength(1);
		expect(closedButtons[0]?.props.label).toBe("New folder");
		closedButtons[0]?.props.onPress();
		expect(setCreating).toHaveBeenCalledWith(true);

		reactMocks.useState
			.mockImplementationOnce(() => [true, setCreating])
			.mockImplementationOnce(() => ["Receipts", setFolderName]);
		const open = FolderPicker({
			value: "",
			folders: [
				{
					id: "f1",
					name: "Work",
					type: "NOTE",
					createdAt: 1,
					updatedAt: 1,
				},
			],
			onChange,
			onCreateFolder,
		} as any);

		const openButtons = findAllByType(open, "AppButton");
		expect(openButtons.map((button) => button.props.label)).toEqual([
			"Cancel",
			"Create",
		]);
		openButtons[0]?.props.onPress();
		expect(setCreating).toHaveBeenCalledWith(false);

		openButtons[1]?.props.onPress();
		await Promise.resolve();
		await Promise.resolve();
		expect(onCreateFolder).toHaveBeenCalledWith("Receipts");
		expect(onChange).toHaveBeenCalledWith("folder-123");
		expect(setFolderName).toHaveBeenCalledWith("");
		expect(setCreating).toHaveBeenCalledWith(false);
	});
});
