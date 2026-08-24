import type { WebDatabase } from "@/db/database";

import {
	deleteBudgetRow,
	getBudgetRow,
	getBudgetRows,
	upsertBudgetRow,
} from "@/repositories/financeRepository";
import type { Budget } from "@/types/Budget";
import type { BudgetPeriod } from "@/types/BudgetPeriod";
import { AppError } from "@/utils/AppError";
import { createId } from "@/utils/id";
import { normalizeMoney } from "@/utils/money";

const getBudgets = async (database: WebDatabase): Promise<readonly Budget[]> =>
	getBudgetRows(database);

const getBudget = async (
	database: WebDatabase,
	id: string,
): Promise<Budget | null> => getBudgetRow(database, id);

const saveBudget = async (
	database: WebDatabase,
	id: string | undefined,
	categoryId: string,
	amount: string,
	period: BudgetPeriod,
): Promise<string> => {
	if (!categoryId) {
		throw new AppError("BUDGET_CATEGORY_REQUIRED", "Select a category.");
	}
	const now = Date.now();
	const existingBudget = id ? await getBudgetRow(database, id) : null;
	const budgetId = id ?? createId();
	try {
		await upsertBudgetRow(database, {
			id: budgetId,
			categoryId,
			categoryName: existingBudget?.categoryName ?? "",
			amount: normalizeMoney(amount),
			period,
			createdAt: existingBudget?.createdAt ?? now,
			updatedAt: now,
		});
		return budgetId;
	} catch (error: unknown) {
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			throw new AppError(
				"DUPLICATE_BUDGET",
				"A budget already exists for this category and period.",
			);
		}
		throw error;
	}
};

const deleteBudget = async (database: WebDatabase, id: string): Promise<void> =>
	deleteBudgetRow(database, id);

export { deleteBudget, getBudget, getBudgets, saveBudget };
