import type Folder from "@/types/Folder";

type FolderFilterChipsProps = Readonly<{
	folders: readonly Folder[];
	selectedFolderId: string;
	onSelectFolder: (folderId: string) => void;
	onDeleteFolder?: (folder: Folder) => void;
	onRenameFolder?: (folder: Folder, newName: string) => void;
}>;

export type { FolderFilterChipsProps as default };
