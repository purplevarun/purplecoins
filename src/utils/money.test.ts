import moneyUtils from "@/utils/money";

import { describe, expect, it } from "vitest";

const { addMoney, multiplyMoney, normalizeMoney, subtractMoney } = moneyUtils;
describe("money utilities", () => {
	it("adds decimal amounts without floating-point drift", () => {
		expect(addMoney("0.1", "0.2")).toBe("0.3");
	});

	it("normalizes user-entered decimals", () => {
		expect(normalizeMoney("00123.4500")).toBe("123.45");
	});

	it("supports exact exchange-rate multiplication", () => {
		expect(multiplyMoney("10.25", "83.5")).toBe("855.875");
	});

	it("keeps signed category nets", () => {
		expect(subtractMoney("13000", "27000")).toBe("-14000");
	});

	it("throws for invalid or non-positive money inputs", () => {
		expect(() => normalizeMoney("abc")).toThrow("Enter a valid positive amount.");
		expect(normalizeMoney("0")).toBe("0");
	});

	it("compares, sums, and absolute-formats amounts", () => {
		expect(moneyUtils.compareMoney("10", "2")).toBe(1);
		expect(moneyUtils.compareMoney("2", "10")).toBe(-1);
		expect(moneyUtils.compareMoney("2", "2")).toBe(0);
		expect(moneyUtils.sumMoney(["1.25", "2.75", "1"])).toBe("5");
		expect(moneyUtils.absoluteMoney("-19.5")).toBe("19.5");
		expect(moneyUtils.ZERO_AMOUNT).toBe("0");
	});

	it("formats money for known and unknown currencies", () => {
		expect(moneyUtils.formatMoney("1234.5", "INR")).toContain("1,234.5");
		expect(moneyUtils.formatMoney("1234.5", "ZZZ")).toContain("ZZZ");
	});
});
