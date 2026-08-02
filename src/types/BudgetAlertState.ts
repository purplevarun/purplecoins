type BudgetAlertState = Readonly<{
	id: string;
	budgetId: string;
	periodKey: string;
	threshold: number;
	notifiedAt: number;
}>;

export type { BudgetAlertState as default };
