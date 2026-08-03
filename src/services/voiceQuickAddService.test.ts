import voiceQuickAddService from "@/services/voiceQuickAddService";

import { describe, expect, it } from "vitest";

const { parseVoiceText } = voiceQuickAddService;

describe("voiceQuickAddService", () => {
	describe("parseVoiceText", () => {
		it("extracts debit amount and merchant from spoken expense text", () => {
			expect(parseVoiceText("I paid 450 rupees to Swiggy")).toEqual({
				amount: "450",
				type: "DEBIT",
				merchant: "Swiggy",
			});
		});

		it("extracts credit amount and merchant from spoken income text", () => {
			expect(parseVoiceText("Received INR 1200 from Acme Corp")).toEqual({
				amount: "1200",
				type: "CREDIT",
				merchant: "Acme Corp",
			});
		});

		it("does not leak regex state across repeated parse calls", () => {
			expect(parseVoiceText("received 90 from refund").type).toBe(
				"CREDIT",
			);
			expect(parseVoiceText("received 110 from cashback").type).toBe(
				"CREDIT",
			);
			expect(parseVoiceText("paid 30 for tea").type).toBe("DEBIT");
			expect(parseVoiceText("paid 60 for lunch").type).toBe("DEBIT");
		});

		it("returns null merchant when only filler words remain", () => {
			expect(parseVoiceText("paid 200 inr").merchant).toBeNull();
		});

		it("returns null fields when speech has no recognizable transaction data", () => {
			expect(parseVoiceText("hello there")).toEqual({
				amount: null,
				type: null,
				merchant: "hello there",
			});
		});
	});
});
