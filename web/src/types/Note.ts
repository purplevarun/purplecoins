type Note = Readonly<{
	id: string;
	folderId: string | null;
	folderName: string | null;
	title: string;
	content: string;
	createdAt: number;
	updatedAt: number;
	hasAttachment: boolean;
}>;

export type { Note };
