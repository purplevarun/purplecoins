import type { WebDatabase } from "@/db/database";

import {
	deleteFolderRow,
	getFolderRows,
	upsertFolderRow,
} from "@/repositories/contentRepository";
import type { Folder } from "@/types/Folder";
import { AppError } from "@/utils/AppError";
import { createId } from "@/utils/id";

const getFolders = async (
	database: WebDatabase,
	type: "NOTE" | "TODO",
): Promise<readonly Folder[]> => getFolderRows(database, type);

const createFolder = async (
	database: WebDatabase,
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
	database: WebDatabase,
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

export { createFolder, deleteFolder, getFolders };
