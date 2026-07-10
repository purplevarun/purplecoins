import type BudgetPeriod from "@/types/BudgetPeriod";

type Budget = Readonly<{
	id: string;
	categoryId: string;
	categoryName: string;
	amount: string;
	period: BudgetPeriod;
	createdAt: number;
	updatedAt: number;
}>;

export type { Budget as default };
