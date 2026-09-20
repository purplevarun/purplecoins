import { describe, expect, it, vi } from "vitest";

describe("money utilities defensive branches", () => {
	it("throws when Decimal reports a non-positive normalized amount", async () => {
		vi.resetModules();
		vi.doMock("decimal.js", () => ({
			default: class DecimalMock {
				constructor(_value: string) {}
				greaterThan(): boolean {
					return false;
				}
				toFixed(): string {
					return "1";
				}
				plus(): this {
					return this;
				}
				minus(): this {
					return this;
				}
				times(): this {
					return this;
				}
				comparedTo(): number {
					return 0;
				}
				abs(): this {
					return this;
				}
				toNumber(): number {
					return 1;
				}
			},
		}));

		const module = await import("@/utils/money");
		expect(() => module.default.normalizeMoney("1")).toThrow(
			"Amount must be greater than zero.",
		);
	});

	it("rethrows non-RangeError failures from Intl formatter", async () => {
		vi.resetModules();
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
			const module = await import("@/utils/money");
			expect(() => module.default.formatMoney("10", "INR")).toThrow(
				"formatter failed",
			);
		} finally {
			Object.defineProperty(Intl, "NumberFormat", {
				configurable: true,
				value: OriginalNumberFormat,
			});
		}
	});

	it("falls back to currency code + fixed amount on RangeError formatter failures", async () => {
		vi.resetModules();
		vi.doUnmock("decimal.js");
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
			const module = await import("@/utils/money");
			expect(module.default.formatMoney("10", "ZZZ")).toBe("ZZZ 10.00");
		} finally {
			Object.defineProperty(Intl, "NumberFormat", {
				configurable: true,
				value: OriginalNumberFormat,
			});
		}
	});
});
