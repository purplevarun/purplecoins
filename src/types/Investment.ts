type Investment = Readonly<{
	id: string;
	name: string;
	label: string | null;
	investmentTypeId: string | null;
	investmentTypeName?: string | null;
	createdAt: number;
	updatedAt: number;
	archived: boolean;
}>;

export type { Investment as default };
