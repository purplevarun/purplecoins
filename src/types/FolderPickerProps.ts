import type Folder from "@/types/Folder";

type FolderPickerProps = Readonly<{
	value: string;
	folders: readonly Folder[];
	onChange: (value: string) => void;
	onCreateFolder: (name: string) => Promise<string>;
}>;

export type { FolderPickerProps as default };
