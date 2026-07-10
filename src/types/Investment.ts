type Investment = Readonly<{
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	archived: boolean;
}>;

export type { Investment };
