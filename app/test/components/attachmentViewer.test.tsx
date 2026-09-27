import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
	Image: "Image",
	Modal: "Modal",
	StyleSheet: { create: (styles: any) => styles },
	View: "View",
}));

vi.mock("react-native-pdf", () => ({
	default: "Pdf",
}));

vi.mock("@/components/CustomText", () => ({
	default: "CustomText",
}));

vi.mock("@/components/HeaderIconButton", () => ({
	default: "HeaderIconButton",
}));

import AttachmentViewer from "@/components/AttachmentViewer";

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

describe("AttachmentViewer", () => {
	it("renders an image preview", () => {
		const tree = AttachmentViewer({
			uri: "file:///cache/photo.jpg",
			fileName: "photo.jpg",
			mimeType: "image/jpeg",
			onClose: vi.fn(),
		});

		const image = findByPredicate(
			tree,
			(node) => node?.type === "Image",
		)[0];
		expect(image.props.source).toEqual({ uri: "file:///cache/photo.jpg" });
	});

	it("renders a pdf preview", () => {
		const tree = AttachmentViewer({
			uri: "file:///cache/report.pdf",
			fileName: "report.pdf",
			mimeType: "application/pdf",
			onClose: vi.fn(),
		});

		const pdf = findByPredicate(tree, (node) => node?.type === "Pdf")[0];
		expect(pdf.props.source).toEqual({ uri: "file:///cache/report.pdf" });
	});

	it("renders a fallback for unsupported types and closes", () => {
		const onClose = vi.fn();
		const tree = AttachmentViewer({
			uri: "file:///cache/data.bin",
			fileName: "data.bin",
			mimeType: "application/octet-stream",
			onClose,
		});

		expect(
			findByPredicate(
				tree,
				(node) =>
					node?.props?.children ===
					"Preview is not available for this file type.",
			),
		).not.toHaveLength(0);

		findByPredicate(
			tree,
			(node) => typeof node?.props?.onPress === "function",
		).forEach((button) => button.props.onPress());
		expect(onClose).toHaveBeenCalled();
	});

	it("stays hidden without a uri and requests close on back", () => {
		const onClose = vi.fn();
		const tree = AttachmentViewer({
			uri: null,
			fileName: "none.pdf",
			mimeType: "application/pdf",
			onClose,
		});

		const modal = findByPredicate(
			tree,
			(node) => node?.type === "Modal",
		)[0];
		expect(modal.props.visible).toBe(false);
		expect(
			findByPredicate(tree, (node) => node?.type === "Image"),
		).toHaveLength(0);
		modal.props.onRequestClose();
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
