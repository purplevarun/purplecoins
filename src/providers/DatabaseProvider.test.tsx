import { beforeEach, describe, expect, it, vi } from "vitest";

const stateSetters = vi.hoisted(() => ({
	setDataVersion: vi.fn(),
	setPendingOperations: vi.fn(),
	setShowLoader: vi.fn(),
}));

const reactMocks = vi.hoisted(() => ({
	useEffect: vi.fn((callback: () => void | (() => void)) => {
		const cleanup = callback();
		if (typeof cleanup === "function") cleanup();
	}),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useEffect: reactMocks.useEffect,
		useMemo: reactMocks.useMemo,
		useState: reactMocks.useState,
	};
});

vi.mock("react-native", () => ({
	ActivityIndicator: () => null,
	Modal: ({ children }: any) => children,
	StyleSheet: {
		create: (styles: any) => styles,
	},
	View: ({ children }: any) => children,
}));

vi.mock("@/components/CustomText", () => ({
	default: ({ children }: any) => children,
}));

vi.mock("@/providers/DatabaseContext", () => ({
	default: {
		Provider: ({ value, children }: any) => ({
			props: { value, children },
		}),
	},
}));

import DatabaseProvider from "@/providers/DatabaseProvider";

const setupStates = (
	dataVersion: number,
	pendingOperations: number,
	showLoader: boolean,
): void => {
	reactMocks.useState.mockReset();
	reactMocks.useState
		.mockImplementationOnce(() => [
			dataVersion,
			stateSetters.setDataVersion,
		])
		.mockImplementationOnce(() => [
			pendingOperations,
			stateSetters.setPendingOperations,
		])
		.mockImplementationOnce(() => [showLoader, stateSetters.setShowLoader]);
};

describe("DatabaseProvider", () => {
	beforeEach(() => {
		Object.values(stateSetters).forEach((setter) => setter.mockClear());
		reactMocks.useEffect.mockClear();
		reactMocks.useMemo.mockClear();
	});

	it("creates tracked database and refreshData behavior", async () => {
		setupStates(0, 0, false);
		const database = {
			name: "db",
			syncMethod: vi.fn(() => 123),
			asyncMethod: vi.fn(async () => "ok"),
		};

		const element = DatabaseProvider({
			children: null,
			database,
		} as any) as any;
		const value = element.props.value;

		expect(stateSetters.setShowLoader).toHaveBeenCalledWith(false);
		value.refreshData();
		expect(stateSetters.setDataVersion).toHaveBeenCalledWith(
			expect.any(Function),
		);

		expect(value.database.name).toBe("db");
		expect(value.database.syncMethod()).toBe(123);
		expect(stateSetters.setPendingOperations).not.toHaveBeenCalledWith(1);

		await value.database.asyncMethod();
		expect(stateSetters.setPendingOperations).toHaveBeenCalledWith(
			expect.any(Function),
		);
		expect(stateSetters.setPendingOperations).toHaveBeenCalledTimes(2);
		const decrementPending = stateSetters.setPendingOperations.mock
			.calls[1]?.[0] as (current: number) => number;
		expect(decrementPending(3)).toBe(2);
		expect(decrementPending(0)).toBe(0);
	});

	it("schedules and clears loader timeout while operations are pending", () => {
		setupStates(0, 1, false);
		const timeoutSpy = vi
			.spyOn(globalThis, "setTimeout")
			.mockImplementation((handler: TimerHandler) => {
				if (typeof handler === "function") handler();
				return 777 as any;
			});
		const clearSpy = vi
			.spyOn(globalThis, "clearTimeout")
			.mockImplementation(() => undefined);

		DatabaseProvider({ children: null, database: {} as any } as any);

		expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 120);
		expect(stateSetters.setShowLoader).toHaveBeenCalledWith(true);
		expect(clearSpy).toHaveBeenCalledWith(777);

		timeoutSpy.mockRestore();
		clearSpy.mockRestore();
	});

	it("tracks pending operations even when async database call rejects", async () => {
		setupStates(0, 0, false);
		const database = {
			failingAsync: vi.fn(async () => {
				throw new Error("db failed");
			}),
		};

		const element = DatabaseProvider({
			children: null,
			database,
		} as any) as any;
		const value = element.props.value;

		await expect(value.database.failingAsync()).rejects.toThrow(
			"db failed",
		);
		expect(stateSetters.setPendingOperations).toHaveBeenCalledTimes(2);
	});

	it("does not track pending operations for non-promise then-like objects", () => {
		setupStates(0, 0, false);
		const thenLikeObject = { then: 123, value: "plain" };
		const database = {
			returnsThenLike: vi.fn(() => thenLikeObject),
		};

		const element = DatabaseProvider({
			children: null,
			database,
		} as any) as any;
		const value = element.props.value;

		expect(value.database.returnsThenLike()).toBe(thenLikeObject);
		expect(stateSetters.setPendingOperations).not.toHaveBeenCalled();
	});
});
