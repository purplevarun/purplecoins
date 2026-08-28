import { beforeEach, describe, expect, it, vi } from "vitest";

const setters = vi.hoisted(() => ({
	setExistingAttachment: vi.fn(),
	setPendingAttachment: vi.fn(),
	setIsRemoved: vi.fn(),
}));

const reactMocks = vi.hoisted(() => ({
	useEffect: vi.fn((callback: () => void) => callback()),
	useState: vi.fn(),
}));

const attachmentServiceMocks = vi.hoisted(() => ({
	deleteAttachment: vi.fn(async () => { }),
	getAttachmentMetadata: vi.fn(async () => null),
	openAttachment: vi.fn(async () => { }),
	pickAttachment: vi.fn(async () => null),
	saveAttachment: vi.fn(async () => { }),
}));

const useDatabaseContextMock = vi.hoisted(() =>
	vi.fn(() => ({
		database: { id: "db" },
	})),
);

vi.mock("react", () => ({
	useEffect: reactMocks.useEffect,
	useState: reactMocks.useState,
}));

vi.mock("@/services/attachmentService", () => ({
	default: attachmentServiceMocks,
}));

vi.mock("@/hooks/useDatabaseContext", () => ({
	default: useDatabaseContextMock,
}));

import useAttachment from "@/hooks/useAttachment";

const setHookState = (
	existingAttachment: any,
	pendingAttachment: any,
	isRemoved: boolean,
): void => {
	reactMocks.useState
		.mockImplementationOnce(() => [existingAttachment, setters.setExistingAttachment])
		.mockImplementationOnce(() => [pendingAttachment, setters.setPendingAttachment])
		.mockImplementationOnce(() => [isRemoved, setters.setIsRemoved]);
};

describe("useAttachment", () => {
	beforeEach(() => {
		reactMocks.useState.mockReset();
		reactMocks.useEffect.mockClear();
		Object.values(setters).forEach((setter) => setter.mockClear());
		Object.values(attachmentServiceMocks).forEach((mockFn) => mockFn.mockClear());
		useDatabaseContextMock.mockClear();
	});

	it("loads existing attachment when ownerId exists", async () => {
		attachmentServiceMocks.getAttachmentMetadata.mockResolvedValueOnce({ id: "a1" });
		setHookState(null, null, false);

		useAttachment("NOTE", "n1");
		await Promise.resolve();

		expect(attachmentServiceMocks.getAttachmentMetadata).toHaveBeenCalledWith(
			{ id: "db" },
			"NOTE",
			"n1",
		);
		expect(setters.setExistingAttachment).toHaveBeenCalledWith({ id: "a1" });
	});

	it("clears existing attachment when ownerId is missing", async () => {
		setHookState({ id: "a1" }, null, false);

		useAttachment("NOTE", undefined);
		await Promise.resolve();

		expect(setters.setExistingAttachment).toHaveBeenCalledWith(null);
	});

	it("handles pick/open/remove actions", async () => {
		setHookState({ id: "a1" }, null, false);
		attachmentServiceMocks.pickAttachment.mockResolvedValueOnce({
			fileName: "x",
			mimeType: "application/pdf",
			sizeBytes: 10,
			content: new Uint8Array([1]),
		});

		const result = useAttachment("NOTE", "n1");

		await result.handlePick();
		expect(setters.setPendingAttachment).toHaveBeenCalledWith(
			expect.objectContaining({ fileName: "x" }),
		);
		expect(setters.setIsRemoved).toHaveBeenCalledWith(false);

		await result.handleOpen();
		expect(attachmentServiceMocks.openAttachment).toHaveBeenCalledWith(
			{ id: "db" },
			{ id: "a1" },
		);

		result.handleRemove();
		expect(setters.setPendingAttachment).toHaveBeenCalledWith(null);
		expect(setters.setIsRemoved).toHaveBeenCalledWith(true);
	});

	it("does not update state when picker returns null", async () => {
		setHookState({ id: "a1" }, null, false);
		attachmentServiceMocks.pickAttachment.mockResolvedValueOnce(null);

		const result = useAttachment("NOTE", "n1");
		await result.handlePick();

		expect(attachmentServiceMocks.pickAttachment).toHaveBeenCalledTimes(1);
		expect(setters.setPendingAttachment).not.toHaveBeenCalled();
		expect(setters.setIsRemoved).not.toHaveBeenCalled();
	});

	it("processes pending save and removal flows", async () => {
		const pending = {
			fileName: "x",
			mimeType: "application/pdf",
			sizeBytes: 10,
			content: new Uint8Array([1]),
		};
		setHookState({ id: "a1" }, pending, false);
		let result = useAttachment("NOTE", "n1");
		await result.processAttachment("record1");
		expect(attachmentServiceMocks.saveAttachment).toHaveBeenCalledWith(
			{ id: "db" },
			"NOTE",
			"record1",
			pending,
		);
		expect(attachmentServiceMocks.deleteAttachment).not.toHaveBeenCalled();

		setHookState({ id: "a1" }, null, true);
		result = useAttachment("NOTE", "n1");
		await result.processAttachment("record2");
		expect(attachmentServiceMocks.deleteAttachment).toHaveBeenCalledWith(
			{ id: "db" },
			"NOTE",
			"record2",
		);
	});
});
