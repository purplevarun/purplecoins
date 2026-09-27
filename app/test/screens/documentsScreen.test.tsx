import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	deleteAttachment: vi.fn(),
	getAttachments: vi.fn(),
	openAttachment: vi.fn(),
	pickAttachment: vi.fn(),
	saveDocument: vi.fn(),
}));

const hookMocks = vi.hoisted(() => ({
	refreshData: vi.fn(),
	confirm: vi.fn(),
}));

const sharingMocks = vi.hoisted(() => ({
	isAvailableAsync: vi.fn(),
	shareAsync: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react")>();
	return {
		...actual,
		useCallback: reactMocks.useCallback,
		useEffect: reactMocks.useEffect,
		useMemo: reactMocks.useMemo,
		useState: reactMocks.useState,
	};
});

vi.mock("@expo/vector-icons", () => ({
	Ionicons: (props: any) => ({ type: "Ionicons", props }),
}));

vi.mock("expo-sharing", () => ({
	isAvailableAsync: sharingMocks.isAvailableAsync,
	shareAsync: sharingMocks.shareAsync,
}));

vi.mock("react-native", () => ({
	Pressable: (props: any) => ({ type: "Pressable", props }),
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("@/components/AppButton", () => ({
	default: (props: any) => ({ type: "AppButton", props }),
}));
vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));
vi.mock("@/components/EmptyState", () => ({
	default: (props: any) => ({ type: "EmptyState", props }),
}));
vi.mock("@/components/FloatingAddButton", () => ({
	default: (props: any) => ({ type: "FloatingAddButton", props }),
}));
vi.mock("@/components/GlassCard", () => ({
	default: (props: any) => ({ type: "GlassCard", props }),
}));
vi.mock("@/components/ListHeader", () => ({
	default: (props: any) => ({ type: "ListHeader", props }),
}));
vi.mock("@/components/Notice", () => ({
	default: (props: any) => ({ type: "Notice", props }),
}));
vi.mock("@/components/ScreenList", () => ({
	default: (props: any) => ({ type: "ScreenList", props }),
}));

vi.mock("@/hooks/useAppDialog", () => ({
	default: () => ({ confirm: hookMocks.confirm }),
}));
vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({
		database: { id: "db" },
		dataVersion: 1,
		refreshData: hookMocks.refreshData,
	}),
}));

vi.mock("@/services/attachmentService", () => ({
	default: {
		deleteAttachment: serviceMocks.deleteAttachment,
		getAttachments: serviceMocks.getAttachments,
		openAttachment: serviceMocks.openAttachment,
		pickAttachment: serviceMocks.pickAttachment,
		saveDocument: serviceMocks.saveDocument,
	},
}));

vi.mock("@/utils/date", () => ({
	default: {
		formatDate: (value: number) => `date:${value}`,
	},
}));
vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/runAfterRender", () => ({
	default: (fn: () => void) => fn(),
}));

import DocumentsScreen from "@/screens/DocumentsScreen";

const flush = async (): Promise<void> => {
	for (let index = 0; index < 6; index += 1) {
		await Promise.resolve();
	}
	await new Promise((resolve) => setTimeout(resolve, 0));
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

describe("DocumentsScreen", () => {
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
		Object.values(sharingMocks).forEach((mockFn) => mockFn.mockReset());

		serviceMocks.getAttachments.mockResolvedValue([
			{
				id: "d1",
				ownerType: "DOCUMENT",
				ownerId: "d1",
				fileName: "report.pdf",
				mimeType: "application/pdf",
				sizeBytes: 2048,
				createdAt: 1,
				updatedAt: 10,
			},
			{
				id: "a1",
				ownerType: "TRANSACTION",
				ownerId: "tx1",
				fileName: "receipt.jpg",
				mimeType: "image/jpeg",
				sizeBytes: 2 * 1024 * 1024,
				createdAt: 2,
				updatedAt: 20,
			},
		]);
		serviceMocks.deleteAttachment.mockResolvedValue(undefined);
		serviceMocks.saveDocument.mockResolvedValue(undefined);
		serviceMocks.openAttachment.mockResolvedValue("cache/dir/file.pdf");
		sharingMocks.isAvailableAsync.mockResolvedValue(true);
		sharingMocks.shareAsync.mockResolvedValue(undefined);
		hookMocks.confirm.mockImplementation(({ onConfirm }: any) =>
			onConfirm(),
		);
	});

	it("loads documents, opens one via share, and deletes one", async () => {
		const setDocuments = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [[], setDocuments];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = DocumentsScreen();
		await flush();

		expect(serviceMocks.getAttachments).toHaveBeenCalledWith({ id: "db" });
		expect(setDocuments).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({ fileName: "report.pdf" }),
				expect.objectContaining({ fileName: "receipt.jpg" }),
			]),
		);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const documentRow = screenList.props.renderItem({
			item: {
				id: "d1",
				ownerType: "DOCUMENT",
				ownerId: "d1",
				fileName: "report.pdf",
				mimeType: "application/pdf",
				sizeBytes: 2048,
				createdAt: 1,
				updatedAt: 10,
			},
		});
		expect(String(JSON.stringify(documentRow))).toContain(
			"Document · 2 KB",
		);

		findByPredicate(
			documentRow,
			(node) =>
				node?.props?.label === "Open" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		expect(serviceMocks.openAttachment).toHaveBeenCalledWith(
			{ id: "db" },
			expect.objectContaining({ id: "d1" }),
		);
		expect(sharingMocks.shareAsync).toHaveBeenCalledWith(
			"cache/dir/file.pdf",
			{ dialogTitle: "report.pdf" },
		);

		sharingMocks.isAvailableAsync.mockResolvedValueOnce(false);
		findByPredicate(
			documentRow,
			(node) =>
				node?.props?.label === "Open" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		expect(sharingMocks.shareAsync).toHaveBeenCalledTimes(1);

		findByPredicate(
			documentRow,
			(node) =>
				node?.props?.label === "Delete" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		expect(serviceMocks.deleteAttachment).toHaveBeenCalledWith(
			{ id: "db" },
			"DOCUMENT",
			"d1",
		);
		expect(hookMocks.refreshData).toHaveBeenCalled();
	});

	it("adds a document through the picker", async () => {
		serviceMocks.pickAttachment.mockResolvedValue({
			fileName: "new.pdf",
			mimeType: "application/pdf",
			sizeBytes: 100,
			content: new Uint8Array([1]),
		});

		const tree = DocumentsScreen();
		await flush();

		const addButton = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				node?.props?.label === undefined,
		)[0];
		await addButton.props.onPress();
		await flush();

		expect(serviceMocks.saveDocument).toHaveBeenCalledWith(
			{ id: "db" },
			expect.objectContaining({ fileName: "new.pdf" }),
		);
		expect(hookMocks.refreshData).toHaveBeenCalled();
	});

	it("skips saving when the picker is canceled", async () => {
		serviceMocks.pickAttachment.mockResolvedValue(null);

		const tree = DocumentsScreen();
		await flush();

		const addButton = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				node?.props?.label === undefined,
		)[0];
		await addButton.props.onPress();
		await flush();

		expect(serviceMocks.saveDocument).not.toHaveBeenCalled();
	});

	it("renders empty state and linked-owner labels", async () => {
		const tree = DocumentsScreen();
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		expect(screenList.props.ListEmptyComponent?.props?.title).toBe(
			"No documents yet",
		);
		expect(screenList.props.keyExtractor({ id: "a1" })).toBe("a1");

		const linkedRow = screenList.props.renderItem({
			item: {
				id: "a1",
				ownerType: "TRANSACTION",
				ownerId: "tx1",
				fileName: "receipt.jpg",
				mimeType: "image/jpeg",
				sizeBytes: 2 * 1024 * 1024,
				createdAt: 2,
				updatedAt: 20,
			},
		});
		expect(String(JSON.stringify(linkedRow))).toContain(
			"Transaction · 2.0 MB",
		);
	});

	it("surfaces load, open, add, and delete failures", async () => {
		serviceMocks.getAttachments.mockRejectedValueOnce(
			new Error("load failed"),
		);
		serviceMocks.openAttachment.mockRejectedValueOnce(
			new Error("open failed"),
		);
		serviceMocks.pickAttachment.mockRejectedValueOnce(
			new Error("pick failed"),
		);
		serviceMocks.deleteAttachment.mockRejectedValueOnce(
			new Error("delete failed"),
		);
		sharingMocks.isAvailableAsync.mockResolvedValueOnce(false);

		const setError = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 2) return ["rendered error", setError];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = DocumentsScreen();
		await flush();
		expect(setError).toHaveBeenCalledWith("load failed");
		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.message === "rendered error",
			),
		).not.toHaveLength(0);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({
			item: {
				id: "a1",
				ownerType: "NOTE",
				ownerId: "n1",
				fileName: "x.pdf",
				mimeType: "application/pdf",
				sizeBytes: 1,
				createdAt: 1,
				updatedAt: 1,
			},
		});

		findByPredicate(
			row,
			(node) =>
				node?.props?.label === "Open" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		expect(setError).toHaveBeenCalledWith("open failed");

		findByPredicate(
			row,
			(node) =>
				node?.props?.label === "Delete" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		expect(setError).toHaveBeenCalledWith("delete failed");

		const addButton = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				node?.props?.label === undefined,
		)[0];
		await addButton.props.onPress();
		await flush();
		expect(setError).toHaveBeenCalledWith("pick failed");
	});
});
