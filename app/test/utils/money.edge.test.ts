import Decimal from "decimal.js";
import { describe, expect, it, vi } from "vitest";

import moneyUtils from "@/utils/money";

describe("money utilities defensive branches", () => {
	it("throws when Decimal reports a non-positive normalized amount", () => {
		const greaterThanSpy = vi
			.spyOn(Decimal.prototype, "greaterThan")
			.mockReturnValue(false);

		try {
			expect(() => moneyUtils.normalizeMoney("1")).toThrow(
				"Amount must be greater than zero.",
			);
		} finally {
			greaterThanSpy.mockRestore();
		}
	});

	it("rethrows non-RangeError failures from Intl formatter", () => {
		const OriginalNumberFormat = Intl.NumberFormat;

		Object.defineProperty(Intl, "NumberFormat", {
			configurable: true,
			value: class NumberFormatMock {
				constructor(
					_locale: string,
					_options: Intl.NumberFormatOptions,
				) {}
				format(_value: number): string {
					throw new TypeError("formatter failed");
				}
			},
		});

		try {
			expect(() => moneyUtils.formatMoney("10", "INR")).toThrow(
				"formatter failed",
			);
		} finally {
			Object.defineProperty(Intl, "NumberFormat", {
				configurable: true,
				value: OriginalNumberFormat,
			});
		}
	});

	it("falls back to currency code + fixed amount on RangeError formatter failures", () => {
		const OriginalNumberFormat = Intl.NumberFormat;

		Object.defineProperty(Intl, "NumberFormat", {
			configurable: true,
			value: class NumberFormatMock {
				constructor(
					_locale: string,
					_options: Intl.NumberFormatOptions,
				) {}
				format(_value: number): string {
					throw new RangeError("bad currency");
				}
			},
		});

		try {
			expect(moneyUtils.formatMoney("10", "ZZZ")).toBe("ZZZ 10.00");
		} finally {
			Object.defineProperty(Intl, "NumberFormat", {
				configurable: true,
				value: OriginalNumberFormat,
			});
		}
	});
});
