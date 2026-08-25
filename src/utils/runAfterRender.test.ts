import runAfterRender from "@/utils/runAfterRender";

import { describe, expect, it, vi } from "vitest";

describe("runAfterRender", () => {
	it("runs callback asynchronously", () => {
		vi.useFakeTimers();
		const callback = vi.fn();

		runAfterRender(callback);
		expect(callback).not.toHaveBeenCalled();

		vi.runAllTimers();
		expect(callback).toHaveBeenCalledTimes(1);
		vi.useRealTimers();
	});

	it("cancels callback when cleanup is called", () => {
		vi.useFakeTimers();
		const callback = vi.fn();

		const cleanup = runAfterRender(callback);
		cleanup();
		vi.runAllTimers();

		expect(callback).not.toHaveBeenCalled();
		vi.useRealTimers();
	});
});
