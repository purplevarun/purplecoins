import AppError from "@/errors/AppError";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	useContext: vi.fn(() => null),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useContext: mocks.useContext,
	};
});

import useDatabaseContext from "@/hooks/useDatabaseContext";

describe("useDatabaseContext", () => {
	it("throws AppError when context is missing", () => {
		mocks.useContext.mockReturnValueOnce(null);
		try {
			useDatabaseContext();
			expect.fail("expected an error");
		} catch (error: unknown) {
			expect(error).toBeInstanceOf(AppError);
			expect((error as AppError).code).toBe("DATABASE_CONTEXT_MISSING");
		}
	});

	it("returns context value when present", () => {
		const value = {
			database: {},
			dataVersion: 1,
			refreshData: vi.fn(),
		};
		mocks.useContext.mockReturnValueOnce(value);
		expect(useDatabaseContext()).toBe(value);
	});
});
