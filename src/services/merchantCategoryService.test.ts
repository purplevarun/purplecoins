import merchantCategoryService from "@/services/merchantCategoryService";

import { beforeEach, describe, expect, it } from "vitest";

import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const { getSuggestionForMerchant, recordMerchantChoice } =
	merchantCategoryService;

describe("merchantCategoryService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("getSuggestionForMerchant", () => {
		it("returns null when no rule has been recorded for the merchant", async () => {
			expect(
				await getSuggestionForMerchant(database, "Swiggy"),
			).toBeNull();
		});

		it("returns null for a blank merchant", async () => {
			expect(await getSuggestionForMerchant(database, "   ")).toBeNull();
		});

		it("returns the recorded category/source for a known merchant", async () => {
			await recordMerchantChoice(
				database,
				"Swiggy",
				"category-1",
				"source-1",
			);

			expect(await getSuggestionForMerchant(database, "Swiggy")).toEqual({
				categoryId: "category-1",
				sourceId: "source-1",
			});
		});

		it("matches merchants case-insensitively and ignoring surrounding whitespace", async () => {
			await recordMerchantChoice(
				database,
				"  Swiggy  ",
				"category-1",
				"source-1",
			);

			expect(await getSuggestionForMerchant(database, "swiggy")).toEqual({
				categoryId: "category-1",
				sourceId: "source-1",
			});
		});
	});

	describe("recordMerchantChoice", () => {
		it("does nothing for a blank merchant", async () => {
			await recordMerchantChoice(database, "   ", "category-1", null);

			expect(await getSuggestionForMerchant(database, "")).toBeNull();
		});

		it("increments usage and overwrites the choice on repeat merchants", async () => {
			await recordMerchantChoice(
				database,
				"Swiggy",
				"category-1",
				"source-1",
			);
			await recordMerchantChoice(
				database,
				"Swiggy",
				"category-2",
				"source-2",
			);

			expect(await getSuggestionForMerchant(database, "Swiggy")).toEqual({
				categoryId: "category-2",
				sourceId: "source-2",
			});
		});
	});
});
