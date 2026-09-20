type LegacyExpenseRow = Readonly<{
	id: string;
	category_id: string;
	amount: string;
	created_at: number;
	updated_at: number;
}>;

export type { LegacyExpenseRow as default };
