import type { SQLiteDatabase } from "expo-sqlite";

import { AppError } from "@/errors/AppError";
import {
	deleteFolderRow,
	getFolderRows,
	upsertFolderRow,
} from "@/repositories/contentRepository";
import type { Folder } from "@/types/Folder";
import { createId } from "@/utils/id";

const getFolders = async (
	database: SQLiteDatabase,
	type: "NOTE" | "TODO",
): Promise<readonly Folder[]> => getFolderRows(database, type);

const createFolder = async (
	database: SQLiteDatabase,
	name: string,
	type: "NOTE" | "TODO",
): Promise<string> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError("FOLDER_NAME_REQUIRED", "Folder name is required.");
	}
	const now = Date.now();
	const id = createId();
	await upsertFolderRow(database, {
		id,
		name: normalizedName,
		type,
		createdAt: now,
		updatedAt: now,
	});
	return id;
};

const deleteFolder = async (
	database: SQLiteDatabase,
	id: string,
): Promise<void> => {
	try {
		await deleteFolderRow(database, id);
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes("FOREIGN KEY")) {
			throw new AppError(
				"FOLDER_IN_USE",
				"Folders containing items cannot be deleted.",
			);
		}
		throw error;
	}
};

const renameFolder = async (
	database: SQLiteDatabase,
	id: string,
	name: string,
): Promise<void> => {
	const normalizedName = name.trim();
	if (!normalizedName) {
		throw new AppError("FOLDER_NAME_REQUIRED", "Folder name is required.");
	}
	// Re-use upsert — fetch existing first to preserve all other fields
	const existing = (await getFolderRows(database, "NOTE"))
		.concat(await getFolderRows(database, "TODO"))
		.find((f) => f.id === id);
	if (!existing) {
		throw new AppError("FOLDER_NOT_FOUND", "Folder not found.");
	}
	await upsertFolderRow(database, {
		...existing,
		name: normalizedName,
		updatedAt: Date.now(),
	});
};

export { createFolder, deleteFolder, getFolders, renameFolder };
