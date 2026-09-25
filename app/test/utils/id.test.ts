import { describe, expect, it, vi } from "vitest";

vi.mock("expo-crypto", () => ({
	randomUUID: vi.fn(() => "mock-uuid"),
}));

import createId from "@/utils/id";

describe("createId", () => {
	it("delegates to expo randomUUID", () => {
		expect(createId()).toBe("mock-uuid");
	});
});
