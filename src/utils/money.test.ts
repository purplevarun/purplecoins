import { describe, expect, it } from "vitest";

import {
	addMoney,
	multiplyMoney,
	normalizeMoney,
	subtractMoney,
} from "./money";

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
});
