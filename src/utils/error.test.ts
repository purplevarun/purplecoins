import getErrorMessage from "@/utils/error";

import { describe, expect, it } from "vitest";

describe("getErrorMessage", () => {
	it("returns message for Error instances", () => {
		expect(getErrorMessage(new Error("boom"))).toBe("boom");
	});

	it("returns fallback for unknown errors", () => {
		expect(getErrorMessage("boom")).toBe("An unexpected error occurred.");
		expect(getErrorMessage(null)).toBe("An unexpected error occurred.");
	});
});
