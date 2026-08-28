import AppError from "@/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	deleteContentRow: vi.fn(async () => {}),
	getCardRow: vi.fn(async () => null),
	getCardRows: vi.fn(async () => []),
	upsertCardRow: vi.fn(async () => {}),
	createId: vi.fn(() => "card-id"),
}));

vi.mock("@/repositories/contentRepository", () => ({
	default: {
		deleteContentRow: mocks.deleteContentRow,
		getCardRow: mocks.getCardRow,
		getCardRows: mocks.getCardRows,
		upsertCardRow: mocks.upsertCardRow,
	},
}));

vi.mock("@/utils/id", () => ({
	default: mocks.createId,
}));

import cardService from "@/services/cardService";

const database = {} as any;

describe("cardService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00.000Z"));
		Object.values(mocks).forEach((mockFn) => mockFn.mockClear());
	});

	it("maps hasAttachment values", async () => {
		mocks.getCardRows.mockResolvedValueOnce([
			{ id: "c1", name: "A", hasAttachment: 1 },
		]);
		mocks.getCardRow.mockResolvedValueOnce({
			id: "c2",
			name: "B",
			hasAttachment: 0,
		});
		mocks.getCardRow.mockResolvedValueOnce(null);

		expect((await cardService.getCards(database))[0]?.hasAttachment).toBe(
			true,
		);
		expect((await cardService.getCard(database, "c2"))?.hasAttachment).toBe(
			false,
		);
		expect(await cardService.getCard(database, "missing")).toBeNull();
	});

	it("validates required fields", async () => {
		await expect(
			cardService.saveCard(database, {
				name: "   ",
				cardType: "CREDIT_CARD",
				cardNumber: "1234",
				expiry: "12/29",
				cvv: "111",
				pin: "0000",
				network: "VISA",
				notes: "x",
			}),
		).rejects.toMatchObject<AppError>({ code: "CARD_FIELDS_REQUIRED" });

		await expect(
			cardService.saveCard(database, {
				name: "Card",
				cardType: "CREDIT_CARD",
				cardNumber: "   ",
				expiry: "12/29",
				cvv: "111",
				pin: "0000",
				network: "VISA",
				notes: "x",
			}),
		).rejects.toMatchObject<AppError>({ code: "CARD_FIELDS_REQUIRED" });
	});

	it("creates new card with normalized strings", async () => {
		const id = await cardService.saveCard(database, {
			name: "  Personal  ",
			cardType: "DEBIT_CARD",
			cardNumber: " 1234 ",
			expiry: " 12/29 ",
			cvv: " 111 ",
			pin: " 0000 ",
			network: " VISA ",
			notes: " note ",
		});

		expect(id).toBe("card-id");
		expect(mocks.upsertCardRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "card-id",
				name: "Personal",
				cardType: "DEBIT_CARD",
				cardNumber: "1234",
				expiry: "12/29",
				cvv: "111",
				pin: "0000",
				network: "VISA",
				notes: "note",
				createdAt: new Date("2026-08-25T12:00:00.000Z").getTime(),
				hasAttachment: false,
			}),
		);
	});

	it("updates existing card preserving createdAt and hasAttachment", async () => {
		mocks.getCardRow.mockResolvedValueOnce({
			id: "c1",
			createdAt: 123,
			hasAttachment: true,
		});

		const id = await cardService.saveCard(database, {
			id: "c1",
			name: "  Updated  ",
			cardType: "CREDIT_CARD",
			cardNumber: " 4321 ",
			expiry: " 01/30 ",
			cvv: " 222 ",
			pin: " 9999 ",
			network: " MC ",
			notes: " changed ",
		});

		expect(id).toBe("c1");
		expect(mocks.upsertCardRow).toHaveBeenCalledWith(
			database,
			expect.objectContaining({
				id: "c1",
				createdAt: 123,
				hasAttachment: true,
			}),
		);
	});

	it("deletes via content repository", async () => {
		await cardService.deleteCard(database, "c1");
		expect(mocks.deleteContentRow).toHaveBeenCalledWith(
			database,
			"cards",
			"CARD",
			"c1",
		);
	});
});
