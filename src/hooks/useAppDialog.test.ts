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

import useAppDialog from "@/hooks/useAppDialog";

describe("useAppDialog", () => {
	it("throws when context is missing", () => {
		mocks.useContext.mockReturnValueOnce(null);
		expect(() => useAppDialog()).toThrow(
			"useAppDialog must be used inside AppDialogProvider.",
		);
	});

	it("returns context value when present", () => {
		const value = {
			dialog: null,
			openDialog: vi.fn(),
			closeDialog: vi.fn(),
		};
		mocks.useContext.mockReturnValueOnce(value);
		expect(useAppDialog()).toBe(value);
	});
});
