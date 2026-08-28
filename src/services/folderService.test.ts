import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteFolderRow: vi.fn(async () => {}),
	getFolderRows: vi.fn(async () => []),
	upsertFolderRow: vi.fn(async () => {}),
	createId: vi.fn(() => "folder-id"),
}));

vi.mock("@/repositories/contentRepository", () => ({
	default: {
		deleteFolderRow: mocks.deleteFolderRow,
		getFolderRows: mocks.getFolderRows,
		upsertFolderRow: mocks.upsertFolderRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import folderService from "@/services/folderService";

const database = {} as any;

describe("folderService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("gets folders by type", async () => {
		mocks.getFolderRows.mockResolvedValueOnce([
			{ id: "f1", name: "A", type: "NOTE" },
		]);
		expect(await folderService.getFolders(database, "NOTE")).toEqual([
			{ id: "f1", name: "A", type: "NOTE" },
		]);
		expect(mocks.getFolderRows).toHaveBeenCalledWith(database, "NOTE");
	});

	it("validates and creates folder", async () => {
		await expect(
			folderService.createFolder(database, "   ", "TODO"),
		).rejects.toMatchObject<AppError>({
			code: "FOLDER_NAME_REQUIRED",
		});

		const id = await folderService.createFolder(
			database,
			"  Work  ",
			"TODO",
		);
		expect(id).toBe("folder-id");
		expect(mocks.upsertFolderRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "folder-id",
				name: "Work",
				type: "TODO",
				createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
				updatedAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			}),
		);
	});

	it("maps foreign-key delete errors and rethrows others", async () => {
		mocks.deleteFolderRow.mockRejectedValueOnce(
			new Error("FOREIGN KEY constraint failed"),
		);
		await expect(
			folderService.deleteFolder(database, "f1"),
		).rejects.toMatchObject<AppError>({
			code: "FOLDER_IN_USE",
		});

		mocks.deleteFolderRow.mockRejectedValueOnce(new Error("disk issue"));
		await expect(
			folderService.deleteFolder(database, "f1"),
		).rejects.toThrow("disk issue");
	});

	it("renames folder with lookup across NOTE and TODO", async () => {
		await expect(
			folderService.renameFolder(database, "f1", "   "),
		).rejects.toMatchObject<AppError>({
			code: "FOLDER_NAME_REQUIRED",
		});

		mocks.getFolderRows.mockResolvedValueOnce([
			{ id: "x", name: "N", type: "NOTE", createdAt: 1, updatedAt: 1 },
		]);
		mocks.getFolderRows.mockResolvedValueOnce([
			{ id: "y", name: "T", type: "TODO", createdAt: 1, updatedAt: 1 },
		]);
		await expect(
			folderService.renameFolder(database, "f1", "New"),
		).rejects.toMatchObject<AppError>({
			code: "FOLDER_NOT_FOUND",
		});

		mocks.getFolderRows.mockResolvedValueOnce([
			{
				id: "f1",
				name: "Old",
				type: "NOTE",
				createdAt: 10,
				updatedAt: 11,
			},
		]);
		mocks.getFolderRows.mockResolvedValueOnce([]);
		await folderService.renameFolder(database, "f1", "  New  ");
		expect(mocks.upsertFolderRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "f1",
				name: "New",
				createdAt: 10,
				updatedAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
			}),
		);
	});
});
