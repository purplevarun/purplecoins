type Folder = Readonly<{
	id: string;
	name: string;
	type: "NOTE" | "TODO";
	createdAt: number;
	updatedAt: number;
}>;

export type { Folder as default };
