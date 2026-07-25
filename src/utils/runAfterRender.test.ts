import runAfterRender from "@/utils/runAfterRender";

import { afterEach, describe, expect, it, vi } from "vitest";

describe("runAfterRender", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("invokes the callback asynchronously (not synchronously)", () => {
		vi.useFakeTimers();
		const callback = vi.fn();

		runAfterRender(callback);

		expect(callback).not.toHaveBeenCalled();
		vi.runAllTimers();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it("returns a cleanup function that cancels the pending callback", () => {
		vi.useFakeTimers();
		const callback = vi.fn();

		const cancel = runAfterRender(callback);
		cancel();
		vi.runAllTimers();

		expect(callback).not.toHaveBeenCalled();
	});
});
