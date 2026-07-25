import getErrorMessage from "@/utils/error";

import { describe, expect, it } from "vitest";

describe("getErrorMessage", () => {
	it("returns the message of an Error instance", () => {
		expect(getErrorMessage(new Error("Boom"))).toBe("Boom");
	});

	it("returns the message of an Error subclass instance", () => {
		class CustomError extends Error {}
		expect(getErrorMessage(new CustomError("Custom failure"))).toBe(
			"Custom failure",
		);
	});

	it("returns a generic message for a plain string", () => {
		expect(getErrorMessage("just a string")).toBe(
			"An unexpected error occurred.",
		);
	});

	it("returns a generic message for null/undefined", () => {
		expect(getErrorMessage(null)).toBe("An unexpected error occurred.");
		expect(getErrorMessage(undefined)).toBe(
			"An unexpected error occurred.",
		);
	});

	it("returns a generic message for a non-Error object", () => {
		expect(getErrorMessage({ message: "not a real error" })).toBe(
			"An unexpected error occurred.",
		);
	});
});
