import { describe, expect, it, vi } from "vitest";

vi.mock("expo-crypto", () => ({
	randomUUID: (): string => "00000000-0000-4000-8000-000000000000",
}));

describe("createId", () => {
	it("delegates to expo-crypto's randomUUID", async () => {
		const createId = (await import("@/utils/id")).default;

		expect(createId()).toBe("00000000-0000-4000-8000-000000000000");
	});

	it("returns whatever expo-crypto's randomUUID produces, unmodified", async () => {
		vi.resetModules();
		vi.doMock("expo-crypto", () => ({
			randomUUID: (): string => "different-value",
		}));
		const createId = (await import("@/utils/id")).default;

		expect(createId()).toBe("different-value");
	});
});
