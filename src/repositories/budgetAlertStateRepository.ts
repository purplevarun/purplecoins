import type BudgetAlertState from "@/types/BudgetAlertState";
import type { SQLiteDatabase } from "expo-sqlite";

const getBudgetAlertStateRows = async (
	database: SQLiteDatabase,
	budgetId: string,
	periodKey: string,
): Promise<readonly BudgetAlertState[]> =>
	database.getAllAsync<BudgetAlertState>(
		`
			SELECT
				id,
				budget_id AS budgetId,
				period_key AS periodKey,
				threshold,
				notified_at AS notifiedAt
			FROM budget_alert_state
			WHERE budget_id = ? AND period_key = ?;
		`,
		budgetId,
		periodKey,
	);

const upsertBudgetAlertStateRow = async (
	database: SQLiteDatabase,
	state: BudgetAlertState,
): Promise<void> => {
	await database.runAsync(
		`
			INSERT INTO budget_alert_state (
				id, budget_id, period_key, threshold, notified_at
			) VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(budget_id, period_key, threshold) DO UPDATE SET
				notified_at = excluded.notified_at;
		`,
		state.id,
		state.budgetId,
		state.periodKey,
		state.threshold,
		state.notifiedAt,
	);
};

const budgetAlertStateRepository = {
	getBudgetAlertStateRows,
	upsertBudgetAlertStateRow,
};

export default budgetAlertStateRepository;
