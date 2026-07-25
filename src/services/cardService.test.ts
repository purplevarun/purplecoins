import cardService from "@/services/cardService";

import { beforeEach, describe, expect, it } from "vitest";

import createTestDatabase from "@/test/sqliteTestDatabase";
import type { SQLiteDatabase } from "expo-sqlite";

const { deleteCard, getCard, getCards, saveCard } = cardService;

const baseEntry = {
	cardType: "CREDIT_CARD" as const,
	cardNumber: "[REDACTED_CREDIT_CARD_NUMBER_1]",
	expiry: "12/30",
	cvv: "123",
	pin: "1234",
	network: "Visa",
	notes: "",
};

describe("cardService", () => {
	let database: SQLiteDatabase;

	beforeEach(() => {
		database = createTestDatabase();
	});

	describe("saveCard (create)", () => {
		it("creates a card with trimmed fields", async () => {
			const id = await saveCard(database, {
				...baseEntry,
				name: "  My Visa  ",
				cardNumber: "  [REDACTED_CREDIT_CARD_NUMBER_1]  ",
			});

			const card = await getCard(database, id);
			expect(card?.name).toBe("My Visa");
			expect(card?.cardNumber).toBe("[REDACTED_CREDIT_CARD_NUMBER_1]");
			expect(card?.cardType).toBe("CREDIT_CARD");
			expect(card?.hasAttachment).toBe(false);
		});

		it("throws CARD_FIELDS_REQUIRED when the name is blank", async () => {
			await expect(
				saveCard(database, { ...baseEntry, name: "   " }),
			).rejects.toMatchObject({ code: "CARD_FIELDS_REQUIRED" });
		});

		it("throws CARD_FIELDS_REQUIRED when the card number is blank", async () => {
			await expect(
				saveCard(database, {
					...baseEntry,
					name: "My Visa",
					cardNumber: "   ",
				}),
			).rejects.toMatchObject({ code: "CARD_FIELDS_REQUIRED" });
		});

		it("supports a DEBIT_CARD type", async () => {
			const id = await saveCard(database, {
				...baseEntry,
				name: "Debit",
				cardType: "DEBIT_CARD",
			});
			expect((await getCard(database, id))?.cardType).toBe("DEBIT_CARD");
		});
	});

	describe("saveCard (update)", () => {
		it("preserves createdAt and hasAttachment when updating", async () => {
			const id = await saveCard(database, { ...baseEntry, name: "Old" });
			const original = await getCard(database, id);

			await saveCard(database, { ...baseEntry, id, name: "New" });

			const updated = await getCard(database, id);
			expect(updated?.name).toBe("New");
			expect(updated?.createdAt).toBe(original?.createdAt);
			expect(updated?.hasAttachment).toBe(false);
		});
	});

	describe("getCards / deleteCard", () => {
		it("lists all cards", async () => {
			await saveCard(database, { ...baseEntry, name: "A" });
			expect(await getCards(database)).toHaveLength(1);
		});

		it("returns null for a missing card", async () => {
			expect(await getCard(database, "missing")).toBeNull();
		});

		it("deletes a card", async () => {
			const id = await saveCard(database, { ...baseEntry, name: "A" });
			await deleteCard(database, id);
			expect(await getCard(database, id)).toBeNull();
		});
	});
});
