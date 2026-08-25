import AppError from "@/errors/AppError";

import { describe, expect, it } from "vitest";

describe("AppError", () => {
	it("sets name, code, and message", () => {
		const error = new AppError("MY_CODE", "my message");

		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe("AppError");
		expect(error.code).toBe("MY_CODE");
		expect(error.message).toBe("my message");
	});
});
