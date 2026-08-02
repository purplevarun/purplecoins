import budgetAlertStateRepository from "@/repositories/budgetAlertStateRepository";

import { beforeEach, describe, expect, it } from "vitest";

import createTestDatabase from "@/test/sqliteTestDatabase";
import type BudgetAlertState from "@/types/BudgetAlertState";
import type { SQLiteDatabase } from "expo-sqlite";

const { getBudgetAlertStateRows, upsertBudgetAlertStateRow } =
	budgetAlertStateRepository;

const buildState = (
	overrides: Partial<BudgetAlertState> = {},
): BudgetAlertState => ({
	id: "state-1",
	budgetId: "budget-1",
	periodKey: "2026-08",
	threshold: 80,
	notifiedAt: 1000,
	...overrides,
});

describe("budgetAlertStateRepository", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	it("returns an empty array when nothing has been recorded for a budget/period", async () => {
		expect(
			await getBudgetAlertStateRows(database, "budget-1", "2026-08"),
		).toEqual([]);
	});

	it("stores and retrieves a threshold state", async () => {
		await upsertBudgetAlertStateRow(database, buildState());

		expect(
			await getBudgetAlertStateRows(database, "budget-1", "2026-08"),
		).toEqual([buildState()]);
	});

	it("keeps 80 and 100 thresholds for the same budget/period as separate rows", async () => {
		await upsertBudgetAlertStateRow(
			database,
			buildState({ id: "state-80", threshold: 80 }),
		);
		await upsertBudgetAlertStateRow(
			database,
			buildState({ id: "state-100", threshold: 100 }),
		);

		const rows = await getBudgetAlertStateRows(
			database,
			"budget-1",
			"2026-08",
		);
		expect(rows.map((row) => row.threshold).sort((a, b) => a - b)).toEqual([
			80, 100,
		]);
	});

	it("scopes rows by period key, not just budget id", async () => {
		await upsertBudgetAlertStateRow(
			database,
			buildState({ periodKey: "2026-07" }),
		);

		expect(
			await getBudgetAlertStateRows(database, "budget-1", "2026-08"),
		).toEqual([]);
	});

	it("scopes rows by budget id, not just period key", async () => {
		await upsertBudgetAlertStateRow(
			database,
			buildState({ budgetId: "budget-2" }),
		);

		expect(
			await getBudgetAlertStateRows(database, "budget-1", "2026-08"),
		).toEqual([]);
	});

	it("overwrites notifiedAt on conflict, keeping the same unique row", async () => {
		await upsertBudgetAlertStateRow(
			database,
			buildState({ notifiedAt: 1000 }),
		);
		await upsertBudgetAlertStateRow(
			database,
			buildState({ id: "state-1-again", notifiedAt: 2000 }),
		);

		const rows = await getBudgetAlertStateRows(
			database,
			"budget-1",
			"2026-08",
		);
		expect(rows).toHaveLength(1);
		expect(rows[0]?.notifiedAt).toBe(2000);
		expect(rows[0]?.id).toBe("state-1");
	});
});
