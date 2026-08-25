import type Folder from "@/types/Folder";

type UseFoldersResult = Readonly<{
	folders: readonly Folder[];
	handleCreateFolder: (name: string) => Promise<string>;
	handleDeleteFolder: (id: string) => Promise<void>;
	handleRenameFolder: (id: string, name: string) => Promise<void>;
}>;

export type { UseFoldersResult as default };
