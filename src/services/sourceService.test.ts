import sourceService from "@/services/sourceService";

import { beforeEach, describe, expect, it } from "vitest";

import AppError from "@/errors/AppError";
import financeRepository from "@/repositories/financeRepository";
import dbFixtures from "@/test/dbFixtures";
import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const {
	createSource,
	deleteSource,
	getArchivedSources,
	getSource,
	getSources,
	setSourceArchived,
	updateSourceName,
	validateSource,
} = sourceService;
const { insertCategory, insertSource } = dbFixtures;
const { createTransactionRow } = financeRepository;

const NOW = 1_780_000_000_000;

describe("sourceService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("createSource", () => {
		it("creates a source with a normalized (uppercased) currency code", async () => {
			const id = await createSource(database, "Bank", "inr");

			const source = await getSource(database, id);
			expect(source?.name).toBe("Bank");
			expect(source?.currencyCode).toBe("INR");
			expect(source?.balance).toBe("0");
			expect(source?.archived).toBe(false);
		});

		it("throws SOURCE_NAME_REQUIRED for a blank name", async () => {
			await expect(createSource(database, "   ", "INR")).rejects.toThrow(
				AppError,
			);
			await expect(
				createSource(database, "", "INR"),
			).rejects.toMatchObject({ code: "SOURCE_NAME_REQUIRED" });
		});

		it("throws SOURCE_NAME_DUPLICATE for a case-insensitive duplicate", async () => {
			await createSource(database, "Bank", "INR");

			await expect(
				createSource(database, "bank", "USD"),
			).rejects.toMatchObject({ code: "SOURCE_NAME_DUPLICATE" });
		});

		it("throws INVALID_CURRENCY for a malformed currency code", async () => {
			await expect(
				createSource(database, "Bank", "INRR"),
			).rejects.toMatchObject({ code: "INVALID_CURRENCY" });
			await expect(
				createSource(database, "Bank", "IN"),
			).rejects.toMatchObject({ code: "INVALID_CURRENCY" });
		});
	});

	describe("getSources / balance calculation", () => {
		it("increases balance on CREDIT and decreases on DEBIT", async () => {
			const source = await insertSource(database, {
				name: "Wallet",
			});
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				{
					classification: "GENERAL",
					type: "CREDIT",
					sourceId: source.id,
					amount: "1000",
					categoryId: category.id,
					reason: "Salary",
					transactionAt: NOW,
				},
				"txn-credit",
				NOW,
			);
			await createTransactionRow(
				database,
				{
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: source.id,
					amount: "300",
					categoryId: category.id,
					reason: "Groceries",
					transactionAt: NOW,
				},
				"txn-debit",
				NOW,
			);

			const sources = await getSources(database);
			const found = sources.find((row) => row.id === source.id);

			expect(found?.balance).toBe("700");
		});

		it("debits the origin and credits the destination on TRANSFER", async () => {
			const sourceA = await insertSource(database, { name: "A" });
			const sourceB = await insertSource(database, { name: "B" });
			await createTransactionRow(
				database,
				{
					classification: "GENERAL",
					type: "TRANSFER",
					sourceId: sourceA.id,
					destinationSourceId: sourceB.id,
					amount: "500",
					toAmount: "500",
					reason: "",
					transactionAt: NOW,
				},
				"txn-transfer",
				NOW,
			);

			const sources = await getSources(database);
			expect(sources.find((row) => row.id === sourceA.id)?.balance).toBe(
				"-500",
			);
			expect(sources.find((row) => row.id === sourceB.id)?.balance).toBe(
				"500",
			);
		});

		it("reports a zero balance for a source with no transactions", async () => {
			const source = await insertSource(database);
			const sources = await getSources(database);
			expect(sources.find((row) => row.id === source.id)?.balance).toBe(
				"0",
			);
		});

		it("excludes archived sources from getSources but includes them in getArchivedSources", async () => {
			const active = await insertSource(database, { name: "Active" });
			const archived = await insertSource(database, {
				name: "Archived",
			});
			await setSourceArchived(database, archived.id, true);

			expect((await getSources(database)).map((row) => row.id)).toEqual([
				active.id,
			]);
			expect(
				(await getArchivedSources(database)).map((row) => row.id),
			).toEqual([archived.id]);
		});
	});

	describe("updateSourceName", () => {
		it("renames a source", async () => {
			const source = await insertSource(database, { name: "Old" });

			await updateSourceName(database, source.id, "New");

			expect((await getSource(database, source.id))?.name).toBe("New");
		});

		it("throws SOURCE_NAME_REQUIRED for a blank name", async () => {
			const source = await insertSource(database);
			await expect(
				updateSourceName(database, source.id, "  "),
			).rejects.toMatchObject({ code: "SOURCE_NAME_REQUIRED" });
		});

		it("throws SOURCE_NAME_DUPLICATE when renaming to another source's name", async () => {
			const sourceA = await insertSource(database, { name: "Alpha" });
			await insertSource(database, { name: "Beta" });

			await expect(
				updateSourceName(database, sourceA.id, "beta"),
			).rejects.toMatchObject({ code: "SOURCE_NAME_DUPLICATE" });
		});

		it("allows renaming a source to its own current name (case-different)", async () => {
			const source = await insertSource(database, { name: "Alpha" });

			await expect(
				updateSourceName(database, source.id, "ALPHA"),
			).resolves.toBeUndefined();
		});
	});

	describe("validateSource / setSourceArchived", () => {
		it("stamps validatedAt", async () => {
			const source = await insertSource(database);
			expect(
				(await getSource(database, source.id))?.validatedAt,
			).toBeNull();

			await validateSource(database, source.id);

			expect(
				(await getSource(database, source.id))?.validatedAt,
			).not.toBeNull();
		});

		it("archives and unarchives a source", async () => {
			const source = await insertSource(database);

			await setSourceArchived(database, source.id, true);
			expect((await getSource(database, source.id))?.archived).toBe(true);

			await setSourceArchived(database, source.id, false);
			expect((await getSource(database, source.id))?.archived).toBe(
				false,
			);
		});
	});

	describe("deleteSource", () => {
		it("deletes an unused source", async () => {
			const source = await insertSource(database);

			await deleteSource(database, source.id);

			expect(await getSource(database, source.id)).toBeNull();
		});

		it("throws SOURCE_IN_USE when the source has linked transactions", async () => {
			const source = await insertSource(database);
			const category = await insertCategory(database);
			await createTransactionRow(
				database,
				{
					classification: "GENERAL",
					type: "DEBIT",
					sourceId: source.id,
					amount: "10",
					categoryId: category.id,
					reason: "x",
					transactionAt: NOW,
				},
				"txn-block-delete",
				NOW,
			);

			await expect(
				deleteSource(database, source.id),
			).rejects.toMatchObject({ code: "SOURCE_IN_USE" });
		});

		it("rethrows an unrelated database error unchanged (not misclassified as SOURCE_IN_USE)", async () => {
			const source = await insertSource(database);
			await database.closeAsync();

			const rejection = await deleteSource(database, source.id).then(
				() => null,
				(error: unknown) => error,
			);

			expect(rejection).not.toMatchObject({ code: "SOURCE_IN_USE" });
			expect((rejection as Error).message).not.toContain("FOREIGN KEY");
		});
	});
});
