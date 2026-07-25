import AppError from "@/errors/AppError";
import moneyUtils from "@/utils/money";

import { describe, expect, it, vi } from "vitest";

const {
	absoluteMoney,
	addMoney,
	compareMoney,
	formatMoney,
	multiplyMoney,
	normalizeMoney,
	subtractMoney,
	sumMoney,
	ZERO_AMOUNT,
} = moneyUtils;

describe("money utilities", () => {
	describe("addMoney / subtractMoney / multiplyMoney", () => {
		it("adds decimal amounts without floating-point drift", () => {
			expect(addMoney("0.1", "0.2")).toBe("0.3");
		});

		it("supports exact exchange-rate multiplication", () => {
			expect(multiplyMoney("10.25", "83.5")).toBe("855.875");
		});

		it("keeps signed category nets", () => {
			expect(subtractMoney("13000", "27000")).toBe("-14000");
		});

		it("subtracting to zero yields the canonical zero string", () => {
			expect(subtractMoney("50", "50")).toBe(ZERO_AMOUNT);
		});
	});

	describe("normalizeMoney", () => {
		it("normalizes user-entered decimals", () => {
			expect(normalizeMoney("00123.4500")).toBe("123.45");
		});

		it("trims surrounding whitespace", () => {
			expect(normalizeMoney("  42  ")).toBe("42");
		});

		it("throws INVALID_AMOUNT for non-numeric input", () => {
			expect(() => normalizeMoney("abc")).toThrow(AppError);
			try {
				normalizeMoney("abc");
			} catch (error) {
				expect(error).toBeInstanceOf(AppError);
				expect((error as AppError).code).toBe("INVALID_AMOUNT");
			}
		});

		it("throws INVALID_AMOUNT for negative numbers (unsigned pattern)", () => {
			expect(() => normalizeMoney("-5")).toThrow(AppError);
		});

		it("throws INVALID_AMOUNT for multiple decimal points", () => {
			expect(() => normalizeMoney("1.2.3")).toThrow(AppError);
		});

		it("throws INVALID_AMOUNT for scientific notation", () => {
			expect(() => normalizeMoney("1e5")).toThrow(AppError);
		});

		it("treats zero as a valid, non-negative amount (decimal.js quirk)", () => {
			// The MONEY_PATTERN regex only allows unsigned digits, and
			// decimal.js's isPositive() treats zero's sign as non-negative,
			// so "0" passes both checks and normalizes to the zero string.
			expect(normalizeMoney("0")).toBe(ZERO_AMOUNT);
		});

		it("normalizes an all-zero decimal amount down to the zero string", () => {
			expect(normalizeMoney("0.00")).toBe(ZERO_AMOUNT);
		});
	});

	describe("compareMoney / absoluteMoney", () => {
		it("compares two equal amounts as 0", () => {
			expect(compareMoney("10", "10.0")).toBe(0);
		});

		it("compares a larger left amount as 1", () => {
			expect(compareMoney("20", "10")).toBe(1);
		});

		it("compares a smaller left amount as -1", () => {
			expect(compareMoney("5", "10")).toBe(-1);
		});

		it("returns the absolute value of a negative amount", () => {
			expect(absoluteMoney("-42.5")).toBe("42.5");
		});

		it("leaves a positive amount unchanged", () => {
			expect(absoluteMoney("42.5")).toBe("42.5");
		});
	});

	describe("sumMoney", () => {
		it("returns zero for an empty list", () => {
			expect(sumMoney([])).toBe(ZERO_AMOUNT);
		});

		it("sums a single amount", () => {
			expect(sumMoney(["10.5"])).toBe("10.5");
		});

		it("sums multiple amounts without drift", () => {
			expect(sumMoney(["0.1", "0.2", "0.3"])).toBe("0.6");
		});

		it("sums negative and positive amounts", () => {
			expect(sumMoney(["100", "-40", "-10"])).toBe("50");
		});
	});

	describe("formatMoney", () => {
		it("formats INR using the Indian numbering system", () => {
			expect(formatMoney("150000", "INR")).toBe("₹1,50,000.00");
		});

		it("formats USD with its own symbol", () => {
			expect(formatMoney("99.9", "USD")).toBe("$99.90");
		});

		it("formats a well-formed but unrecognized currency code generically", () => {
			// ICU has no symbol for "ZZZ" so it falls back to the code
			// itself, separated from the amount by a non-breaking space.
			expect(formatMoney("10", "ZZZ")).toBe("ZZZ\u00A010.00");
		});

		it("falls back to a plain 'CODE amount' string for malformed currency codes", () => {
			expect(formatMoney("123.4", "ABCD")).toBe("ABCD 123.40");
		});

		it("rethrows a non-RangeError from the underlying formatter unchanged", () => {
			// formatMoney only special-cases RangeError (an invalid/unknown
			// currency code); anything else escaping Intl.NumberFormat
			// should propagate as-is rather than being swallowed.
			const formatSpy = vi
				.spyOn(Intl, "NumberFormat")
				.mockImplementation(
					function FakeNumberFormat(): Intl.NumberFormat {
						throw new TypeError("Unexpected formatter failure");
					},
				);

			expect(() => formatMoney("10", "INR")).toThrow(TypeError);

			formatSpy.mockRestore();
		});
	});
});
