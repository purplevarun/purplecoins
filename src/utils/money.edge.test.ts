import { describe, expect, it, vi } from "vitest";

describe("money utilities defensive branches", () => {
	it("throws when Decimal reports a non-positive normalized amount", async () => {
		vi.resetModules();
		vi.doMock("decimal.js", () => ({
			default: class DecimalMock {
				constructor(_value: string) {}
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
});