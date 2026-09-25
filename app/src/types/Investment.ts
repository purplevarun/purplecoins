type Investment = Readonly<{
	id: string;
	name: string;
	investmentTypeId: string | null;
	investmentTypeName?: string | null;
	platformId?: string | null;
	platformName?: string | null;
	createdAt: number;
	updatedAt: number;
	archived: boolean;
}>;

export type { Investment as default };
