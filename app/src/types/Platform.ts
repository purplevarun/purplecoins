type Platform = Readonly<{
	id: string;
	name: string;
	archived?: number;
	createdAt: number;
	updatedAt: number;
}>;

export type { Platform as default };
