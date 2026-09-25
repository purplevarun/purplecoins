import createTestDatabase from "@test/helpers/sqliteTestDatabase";
import type TransactionInput from "@/types/TransactionInput";
import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/utils/id", () => ({ default: () => randomUUID() }));
vi.mock("expo-document-picker", () => ({}));
vi.mock("expo-file-system", () => ({}));
vi.mock("expo-sharing", () => ({}));

import SCHEMA_MIGRATIONS from "@/database/migrations";
import SCHEMA_SQL from "@/database/schema";
import financeRepository from "@/repositories/financeRepository";
import analysisService from "@/services/analysisService";
import sourceService from "@/services/sourceService";
import transactionService from "@/services/transactionService";

const createFixture = async (): Promise<
	ReturnType<typeof createTestDatabase>
> => {
	const result = createTestDatabase();
	await result.database.execAsync(SCHEMA_SQL);
	for (const migration of SCHEMA_MIGRATIONS) {
		await result.database.execAsync(migration);
	}
	result.sqlite.exec(`
		INSERT INTO sources VALUES ('bank', 'Bank', 'INR', NULL, NULL, 1, 2);
		INSERT INTO categories VALUES ('food', 'Food', 0, NULL, 1, 2);
		INSERT INTO categories VALUES ('grocery', 'Grocery', 0, NULL, 1, 2);
		INSERT INTO categories VALUES ('salary', 'Salary', 1, NULL, 1, 2);
	`);
	return result;
};

const expense: TransactionInput = {
	classification: "GENERAL",
	type: "DEBIT",
	sourceId: "bank",
	amount: "0",
	reason: "Supermart shopping",
	transactionAt: 100,
	items: [
		{ categoryId: "food", amount: "100" },
		{ categoryId: "grocery", amount: "100" },
	],
};
const receipt = {
	fileName: "receipt.txt",
	mimeType: "text/plain",
	sizeBytes: 3,
	content: new Uint8Array([1, 2, 3]),
};

describe("split expense persistence", () => {
	it("keeps credit category validation and reason defaults intact", async () => {
		const { database } = await createFixture();
		const income: TransactionInput = {
			classification: "GENERAL",
			type: "CREDIT",
			sourceId: "bank",
			categoryId: "salary",
			amount: "1",
			reason: "  ",
			transactionAt: 100,
		};
		const id = await transactionService.saveTransaction(database, income);
		expect(
			await transactionService.getTransaction(database, id),
		).toMatchObject({ reason: "Salary", items: [], amount: "1" });
		await expect(
			transactionService.saveTransaction(database, {
				...income,
				categoryId: "missing",
			}),
		).rejects.toMatchObject({ code: "CATEGORY_NOT_FOUND" });
		await expect(
			transactionService.saveTransaction(database, {
				...income,
				categoryId: undefined,
			}),
		).rejects.toMatchObject({ code: "CATEGORY_REQUIRED" });
	});

	it("propagates unexpected item lookup failures and preserves foreign-key checks", async () => {
		const { database, sqlite } = await createFixture();
		await expect(
			transactionService.saveTransaction(database, {
				...expense,
				sourceId: "missing",
			}),
		).rejects.toThrow("FOREIGN KEY");
		const lookup = vi
			.spyOn(database, "getFirstAsync")
			.mockRejectedValueOnce(new Error("lookup failed"));
		await expect(
			transactionService.saveTransaction(database, expense),
		).rejects.toThrow("lookup failed");
		lookup.mockRestore();
		expect(sqlite.prepare("SELECT * FROM transactions").all()).toEqual([]);
	});
	it("saves one payment, two items, and one receipt without double counting", async () => {
		const { sqlite, database } = await createFixture();
		const id = await transactionService.saveTransaction(
			database,
			expense,
			receipt,
		);
		const saved = await transactionService.getTransaction(database, id);
		expect(saved).toMatchObject({
			id,
			amount: "200",
			reason: "Supermart shopping",
			categoryId: null,
			hasAttachment: true,
		});
		expect(
			saved?.items.map((item) => [
				item.categoryName,
				item.amount,
				item.position,
			]),
		).toEqual([
			["Food", "100", 0],
			["Grocery", "100", 1],
		]);
		expect(new Set(saved?.items.map((item) => item.id)).size).toBe(2);
		expect(await sourceService.getSources(database)).toMatchObject([
			{ balance: "-200" },
		]);
		const analysis = await analysisService.getAnalysisSummary(database, {
			dateRange: { start: 0, end: 200 },
			isNativeCurrency: true,
		});
		expect(analysis.totalExpense).toBe("200");
		expect(
			analysis.categories.map((category) => [
				category.categoryId,
				category.debits,
			]),
		).toEqual([
			["food", "100"],
			["grocery", "100"],
		]);
		expect(
			(await transactionService.getTransactionPage(database))
				.transactions,
		).toHaveLength(1);
		expect(
			await transactionService.getLinkedTransactions(database, {
				kind: "CATEGORY",
				entityId: "grocery",
			}),
		).toHaveLength(1);
		expect(
			sqlite.prepare("SELECT owner_id, content FROM attachments").all(),
		).toEqual([{ owner_id: id, content: receipt.content }]);
	});

	it("keeps retained item IDs through reordering and deletes the payment and receipt together", async () => {
		const { sqlite, database } = await createFixture();
		const id = await transactionService.saveTransaction(
			database,
			expense,
			receipt,
		);
		const saved = await transactionService.getTransaction(database, id);
		const items = saved?.items;
		if (!items) throw new Error("Missing saved items");
		await transactionService.saveTransaction(database, {
			...expense,
			id,
			items: [...items]
				.reverse()
				.map((item) => ({ ...item, amount: "50.05" })),
		});
		const updated = await transactionService.getTransaction(database, id);
		expect(updated?.amount).toBe("100.1");
		expect(updated?.items.map((item) => item.id)).toEqual(
			[...items].reverse().map((item) => item.id),
		);
		expect(updated?.items.map((item) => item.createdAt)).toEqual(
			[...items].reverse().map((item) => item.createdAt),
		);
		await transactionService.saveTransaction(
			database,
			{ ...expense, id, items: updated?.items.slice(0, 1) },
			null,
		);
		expect(
			(await transactionService.getTransaction(database, id))?.items,
		).toHaveLength(1);
		expect(sqlite.prepare("SELECT * FROM attachments").all()).toEqual([]);
		await transactionService.deleteTransaction(database, id);
		expect(sqlite.prepare("SELECT * FROM transaction_items").all()).toEqual(
			[],
		);
		expect(await sourceService.getSources(database)).toMatchObject([
			{ balance: "0" },
		]);
	});

	it("rolls back new payments if an item or receipt write fails", async () => {
		const { sqlite, database } = await createFixture();
		sqlite.exec(
			"CREATE TRIGGER fail_item BEFORE INSERT ON transaction_items WHEN NEW.position = 1 BEGIN SELECT RAISE(ABORT, 'item failure'); END;",
		);
		await expect(
			transactionService.saveTransaction(database, expense, receipt),
		).rejects.toThrow("item failure");
		expect(sqlite.prepare("SELECT * FROM transactions").all()).toEqual([]);
		expect(sqlite.prepare("SELECT * FROM transaction_items").all()).toEqual(
			[],
		);
		sqlite.exec(
			"DROP TRIGGER fail_item; CREATE TRIGGER fail_receipt BEFORE INSERT ON attachments BEGIN SELECT RAISE(ABORT, 'receipt failure'); END;",
		);
		await expect(
			transactionService.saveTransaction(database, expense, receipt),
		).rejects.toThrow("receipt failure");
		expect(sqlite.prepare("SELECT * FROM transactions").all()).toEqual([]);
		expect(sqlite.prepare("SELECT * FROM transaction_items").all()).toEqual(
			[],
		);
	});

	it("restores the original split and receipt when an edit fails", async () => {
		const { sqlite, database } = await createFixture();
		const id = await transactionService.saveTransaction(
			database,
			expense,
			receipt,
		);
		const original = await transactionService.getTransaction(database, id);
		sqlite.exec(
			"CREATE TRIGGER fail_receipt BEFORE INSERT ON attachments BEGIN SELECT RAISE(ABORT, 'receipt failure'); END;",
		);
		await expect(
			transactionService.saveTransaction(
				database,
				{
					...expense,
					id,
					items: [{ categoryId: "food", amount: "1" }],
				},
				receipt,
			),
		).rejects.toThrow("receipt failure");
		expect(await transactionService.getTransaction(database, id)).toEqual(
			original,
		);
		expect(sqlite.prepare("SELECT content FROM attachments").get()).toEqual(
			{ content: receipt.content },
		);
	});

	it("validates all items and disallows stale or duplicated item identities", async () => {
		const { database } = await createFixture();
		await expect(
			transactionService.saveTransaction(database, {
				...expense,
				items: [],
			}),
		).rejects.toMatchObject({ code: "TRANSACTION_ITEMS_REQUIRED" });
		await expect(
			transactionService.saveTransaction(database, {
				...expense,
				items: undefined,
			}),
		).rejects.toMatchObject({ code: "TRANSACTION_ITEMS_REQUIRED" });
		await expect(
			transactionService.saveTransaction(database, {
				...expense,
				items: [
					{ categoryId: "food", amount: "100" },
					{ categoryId: "grocery", amount: "0" },
				],
			}),
		).rejects.toThrow("Item 2");
		await expect(
			transactionService.saveTransaction(database, {
				...expense,
				id: "missing",
			}),
		).rejects.toMatchObject({ code: "TRANSACTION_NOT_FOUND" });
		await expect(
			transactionService.saveTransaction(database, {
				...expense,
				items: [{ id: "foreign", categoryId: "food", amount: "1" }],
			}),
		).rejects.toMatchObject({ code: "TRANSACTION_ITEM_INVALID" });
		const id = await transactionService.saveTransaction(database, expense);
		const first = (await transactionService.getTransaction(database, id))
			?.items[0];
		if (!first) throw new Error("Missing item");
		await expect(
			transactionService.saveTransaction(database, {
				...expense,
				id,
				items: [first, first],
			}),
		).rejects.toMatchObject({ code: "TRANSACTION_ITEM_INVALID" });
		await expect(
			transactionService.saveTransaction(database, {
				...expense,
				type: "CREDIT",
			}),
		).rejects.toMatchObject({ code: "TRANSACTION_ITEMS_UNSUPPORTED" });
	});

	it("preserves decimal precision, allows repeated categories, and uses shared reason defaults", async () => {
		const { database } = await createFixture();
		const id = await transactionService.saveTransaction(database, {
			...expense,
			reason: "  ",
			items: [
				{ categoryId: "food", amount: "0.1" },
				{ categoryId: "grocery", amount: "0.2" },
				{ categoryId: "food", amount: "0.3" },
			],
		});
		expect(
			await transactionService.getTransaction(database, id),
		).toMatchObject({ amount: "0.6", reason: "Food, Grocery" });
		expect(
			(await financeRepository.getCategoryRows(database)).map(
				(category) => category.name,
			),
		).toEqual(["Food", "Grocery", "Salary"]);
		await transactionService.saveTransaction(database, {
			...expense,
			id,
			type: "CREDIT",
			categoryId: "salary",
			amount: "10",
			items: undefined,
		});
		expect(
			await transactionService.getTransaction(database, id),
		).toMatchObject({ amount: "10", categoryId: "salary", items: [] });
		expect(await sourceService.getSources(database)).toMatchObject([
			{ balance: "10" },
		]);
	});
});
