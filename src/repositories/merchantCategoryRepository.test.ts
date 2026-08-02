import merchantCategoryRepository from "@/repositories/merchantCategoryRepository";

import { beforeEach, describe, expect, it } from "vitest";

import createTestDatabase from "@/test/sqliteTestDatabase";
import type MerchantCategoryRule from "@/types/MerchantCategoryRule";
import type { SQLiteDatabase } from "expo-sqlite";

const { getMerchantCategoryRuleRow, upsertMerchantCategoryRuleRow } =
	merchantCategoryRepository;

const buildRule = (
	overrides: Partial<MerchantCategoryRule> = {},
): MerchantCategoryRule => ({
	id: "rule-1",
	merchantKey: "swiggy",
	categoryId: "category-1",
	sourceId: "source-1",
	usageCount: 1,
	lastUsedAt: 1000,
	createdAt: 1000,
	updatedAt: 1000,
	...overrides,
});

describe("merchantCategoryRepository", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	it("returns null for a merchant key that has never been recorded", async () => {
		expect(
			await getMerchantCategoryRuleRow(database, "unknown"),
		).toBeNull();
	});

	it("stores and retrieves a rule", async () => {
		await upsertMerchantCategoryRuleRow(database, buildRule());

		expect(await getMerchantCategoryRuleRow(database, "swiggy")).toEqual(
			buildRule(),
		);
	});

	it("stores null category/source ids", async () => {
		await upsertMerchantCategoryRuleRow(
			database,
			buildRule({ categoryId: null, sourceId: null }),
		);

		const rule = await getMerchantCategoryRuleRow(database, "swiggy");
		expect(rule?.categoryId).toBeNull();
		expect(rule?.sourceId).toBeNull();
	});

	it("overwrites category/source/usage on conflict, keeping the same id", async () => {
		await upsertMerchantCategoryRuleRow(database, buildRule());
		await upsertMerchantCategoryRuleRow(
			database,
			buildRule({
				categoryId: "category-2",
				sourceId: "source-2",
				usageCount: 2,
				lastUsedAt: 2000,
				updatedAt: 2000,
			}),
		);

		const rule = await getMerchantCategoryRuleRow(database, "swiggy");
		expect(rule).toEqual(
			buildRule({
				categoryId: "category-2",
				sourceId: "source-2",
				usageCount: 2,
				lastUsedAt: 2000,
				updatedAt: 2000,
			}),
		);
	});

	it("keeps distinct merchant keys independent", async () => {
		await upsertMerchantCategoryRuleRow(
			database,
			buildRule({ id: "rule-a", merchantKey: "swiggy" }),
		);
		await upsertMerchantCategoryRuleRow(
			database,
			buildRule({ id: "rule-b", merchantKey: "zomato" }),
		);

		expect((await getMerchantCategoryRuleRow(database, "swiggy"))?.id).toBe(
			"rule-a",
		);
		expect((await getMerchantCategoryRuleRow(database, "zomato"))?.id).toBe(
			"rule-b",
		);
	});
});
