type Trip = Readonly<{
	id: string;
	name: string;
	tripTypeId?: string | null;
	tripTypeName?: string | null;
	createdAt: number;
	updatedAt: number;
	archived: boolean;
}>;

export type { Trip as default };
