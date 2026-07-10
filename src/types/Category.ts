type Category = Readonly<{
	id: string;
	name: string;
	isIncome: boolean;
	createdAt: number;
	updatedAt: number;
	archived: boolean;
}>;

export type { Category };
