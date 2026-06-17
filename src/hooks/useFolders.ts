import { useEffect, useState } from "react";

import { useDatabaseContext } from "@/hooks/useDatabaseContext";
import {
	createFolder,
	deleteFolder,
	getFolders,
	renameFolder,
} from "@/services/folderService";
import type { Folder } from "@/types/Folder";

type UseFoldersResult = Readonly<{
	folders: readonly Folder[];
	handleCreateFolder: (name: string) => Promise<string>;
	handleDeleteFolder: (id: string) => Promise<void>;
	handleRenameFolder: (id: string, name: string) => Promise<void>;
}>;

const useFolders = (type: "NOTE" | "TODO"): UseFoldersResult => {
	const { database, dataVersion, refreshData } = useDatabaseContext();
	const [folders, setFolders] = useState<readonly Folder[]>([]);

	useEffect(() => {
		const getFolderData = async (): Promise<void> => {
			setFolders(await getFolders(database, type));
		};
		void getFolderData();
	}, [database, dataVersion, type]);

	const handleCreateFolder = async (name: string): Promise<string> => {
		const id = await createFolder(database, name, type);
		setFolders(await getFolders(database, type));
		refreshData();
		return id;
	};

	const handleDeleteFolder = async (id: string): Promise<void> => {
		await deleteFolder(database, id);
		setFolders(await getFolders(database, type));
		refreshData();
	};

	const handleRenameFolder = async (
		id: string,
		name: string,
	): Promise<void> => {
		await renameFolder(database, id, name);
		setFolders(await getFolders(database, type));
		refreshData();
	};

	return {
		folders,
		handleCreateFolder,
		handleDeleteFolder,
		handleRenameFolder,
	};
};

export { useFolders };
