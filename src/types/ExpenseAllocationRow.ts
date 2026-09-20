type ExpenseAllocationRow = Readonly<{
	id: string;
	amount: string;
	itemAmount: string | null;
}>;

export type { ExpenseAllocationRow as default };
