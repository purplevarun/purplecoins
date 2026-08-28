import { describe, expect, it, vi } from "vitest";

describe("money utilities defensive branches", () => {
	it("throws when Decimal reports a non-positive normalized amount", async () => {
		vi.resetModules();
		vi.doMock("decimal.js", () => ({
			default: class DecimalMock {
				constructor(_value: string) { }
				isPositive(): boolean {
					return false;
				}
				toFixed(): string {
					return "1";
				}
				plus(): DecimalMock {
					return this;
				}
				minus(): DecimalMock {
					return this;
				}
				times(): DecimalMock {
					return this;
				}
				comparedTo(): number {
					return 0;
				}
				abs(): DecimalMock {
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
				constructor(_locale: string, _options: Intl.NumberFormatOptions) { }
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
});
