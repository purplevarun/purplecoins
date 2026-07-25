import investmentService from "@/services/investmentService";

import { beforeEach, describe, expect, it } from "vitest";

import financeRepository from "@/repositories/financeRepository";
import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	deleteInvestment,
	getArchivedInvestments,
	getInvestment,
	getInvestments,
	saveInvestment,
	setInvestmentArchived,
} = investmentService;
const { insertInvestment, insertSource } = dbFixtures;
const { createTransactionRow } = financeRepository;

const NOW = 1_780_000_000_000;

describe("investmentService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	it("creates an investment and coerces archived to a boolean", async () => {
		const id = await saveInvestment(database, undefined, "Index Fund");

		const investment = await getInvestment(database, id);
		expect(investment?.name).toBe("Index Fund");
		expect(investment?.archived).toBe(false);
	});

	it("throws INVESTMENT_NAME_REQUIRED for a blank name", async () => {
		await expect(
			saveInvestment(database, undefined, ""),
		).rejects.toMatchObject({ code: "INVESTMENT_NAME_REQUIRED" });
	});

	it("throws INVESTMENT_NAME_DUPLICATE case-insensitively", async () => {
		await saveInvestment(database, undefined, "Index Fund");

		await expect(
			saveInvestment(database, undefined, "index fund"),
		).rejects.toMatchObject({ code: "INVESTMENT_NAME_DUPLICATE" });
	});

	it("updates an existing investment's name while preserving createdAt", async () => {
		const existing = await insertInvestment(database, {
			name: "Old",
			createdAt: 1000,
		});

		await saveInvestment(database, existing.id, "New");

		const updated = await getInvestment(database, existing.id);
		expect(updated?.name).toBe("New");
		expect(updated?.createdAt).toBe(1000);
	});

	it("separates active from archived investments", async () => {
		const active = await insertInvestment(database, { name: "Active" });
		const archived = await insertInvestment(database, {
			name: "Archived",
		});
		await setInvestmentArchived(database, archived.id, true);

		expect((await getInvestments(database)).map((row) => row.id)).toEqual([
			active.id,
		]);
		expect(
			(await getArchivedInvestments(database)).map((row) => row.id),
		).toEqual([archived.id]);
	});

	it("deletes an unused investment", async () => {
		const investment = await insertInvestment(database);
		await deleteInvestment(database, investment.id);
		expect(await getInvestment(database, investment.id)).toBeNull();
	});

	it("maps a foreign-key violation to INVESTMENT_IN_USE", async () => {
		const source = await insertSource(database);
		const investment = await insertInvestment(database);
		await createTransactionRow(
			database,
			{
				classification: "INVESTMENT",
				type: "DEBIT",
				sourceId: source.id,
				investmentId: investment.id,
				amount: "10",
				reason: "SIP",
				transactionAt: NOW,
			},
			"txn-1",
			NOW,
		);

		await expect(
			deleteInvestment(database, investment.id),
		).rejects.toMatchObject({ code: "INVESTMENT_IN_USE" });
	});

	it("rethrows an unrelated database error unchanged (not misclassified as INVESTMENT_IN_USE)", async () => {
		const investment = await insertInvestment(database);
		await database.closeAsync();

		const rejection = await deleteInvestment(database, investment.id).then(
			() => null,
			(error: unknown) => error,
		);

		expect(rejection).not.toMatchObject({ code: "INVESTMENT_IN_USE" });
		expect((rejection as Error).message).not.toContain("FOREIGN KEY");
	});
});
