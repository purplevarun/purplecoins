import { beforeEach, describe, expect, it, vi } from "vitest";

const setFolders = vi.fn();

const reactMocks = vi.hoisted(() => ({
	useEffect: vi.fn((callback: () => void) => callback()),
	useState: vi.fn(() => [[], setFolders]),
}));

const folderServiceMocks = vi.hoisted(() => ({
	createFolder: vi.fn(async () => "new-folder"),
	deleteFolder: vi.fn(async () => {}),
	getFolders: vi.fn(async () => [{ id: "f1", name: "A", type: "NOTE" }]),
	renameFolder: vi.fn(async () => {}),
}));

const useDatabaseContextMock = vi.hoisted(() =>
	vi.fn(() => ({
		database: { id: "db" },
		dataVersion: 1,
		refreshData: vi.fn(),
	})),
);

vi.mock("react", () => ({
	useEffect: reactMocks.useEffect,
	useState: reactMocks.useState,
}));

vi.mock("@/services/folderService", () => ({
	default: folderServiceMocks,
}));

vi.mock("@/hooks/useDatabaseContext", () => ({
	default: useDatabaseContextMock,
}));

import useFolders from "@/hooks/useFolders";

describe("useFolders", () => {
	beforeEach(() => {
		setFolders.mockClear();
		reactMocks.useState.mockReset();
		reactMocks.useState.mockImplementation(() => [[], setFolders]);
		Object.values(folderServiceMocks).forEach((mockFn) => mockFn.mockClear());
		folderServiceMocks.getFolders.mockImplementation(async () => [
			{ id: "f1", name: "A", type: "NOTE" },
		]);
		folderServiceMocks.createFolder.mockImplementation(
			async () => "new-folder",
		);
		folderServiceMocks.deleteFolder.mockImplementation(async () => {});
		folderServiceMocks.renameFolder.mockImplementation(async () => {});
		useDatabaseContextMock.mockReset();
		useDatabaseContextMock.mockImplementation(() => ({
			database: { id: "db" },
			dataVersion: 1,
			refreshData: vi.fn(),
		}));
	});

	it("refreshes data after folders are reloaded on create", async () => {
		const callOrder: string[] = [];
		folderServiceMocks.createFolder.mockImplementationOnce(async () => {
			callOrder.push("create");
			return "ordered-folder";
		});
		folderServiceMocks.getFolders.mockImplementation(async () => {
			callOrder.push("reload");
			return [{ id: "f-order", name: "Ordered", type: "NOTE" } as any];
		});
		const refreshData = vi.fn(() => {
			callOrder.push("refresh");
		});
		useDatabaseContextMock.mockReturnValueOnce({
			database: { id: "db" },
			dataVersion: 4,
			refreshData,
		});

		const result = useFolders("NOTE");
		await result.handleCreateFolder("Ordered");

		expect(callOrder).toEqual(["reload", "create", "reload", "refresh"]);
	});

	it("loads folders on hook initialization", async () => {
		useFolders("NOTE");
		await Promise.resolve();
		expect(folderServiceMocks.getFolders).toHaveBeenCalledWith(
			{ id: "db" },
			"NOTE",
		);
		expect(setFolders).toHaveBeenCalledWith([
			{ id: "f1", name: "A", type: "NOTE" },
		]);
	});

	it("creates, deletes, and renames folders and refreshes data", async () => {
		const refreshData = vi.fn();
		useDatabaseContextMock.mockReturnValueOnce({
			database: { id: "db" },
			dataVersion: 2,
			refreshData,
		});

		const result = useFolders("NOTE");
		await result.handleCreateFolder("New");
		await result.handleDeleteFolder("f1");
		await result.handleRenameFolder("f1", "Renamed");

		expect(folderServiceMocks.createFolder).toHaveBeenCalledWith(
			{ id: "db" },
			"New",
			"NOTE",
		);
		expect(folderServiceMocks.deleteFolder).toHaveBeenCalledWith(
			{ id: "db" },
			"f1",
		);
		expect(folderServiceMocks.renameFolder).toHaveBeenCalledWith(
			{ id: "db" },
			"f1",
			"Renamed",
		);
		expect(refreshData).toHaveBeenCalledTimes(3);
	});

	it("supports TODO type and returns new folder id from create", async () => {
		folderServiceMocks.createFolder.mockResolvedValueOnce("todo-folder-id");
		const refreshData = vi.fn();
		useDatabaseContextMock.mockReturnValueOnce({
			database: { id: "db" },
			dataVersion: 3,
			refreshData,
		});

		const result = useFolders("TODO");
		const createdId = await result.handleCreateFolder("Work Todos");

		expect(createdId).toBe("todo-folder-id");
		expect(folderServiceMocks.createFolder).toHaveBeenCalledWith(
			{ id: "db" },
			"Work Todos",
			"TODO",
		);
		expect(folderServiceMocks.getFolders).toHaveBeenCalledWith(
			{ id: "db" },
			"TODO",
		);
		expect(refreshData).toHaveBeenCalledTimes(1);
	});
});
