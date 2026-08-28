import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn((effect: () => void) => effect()),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	fetchExchangeRates: vi.fn(),
	getExchangeRates: vi.fn(),
	saveManualExchangeRate: vi.fn(),
	getSources: vi.fn(),
}));

const hookMocks = vi.hoisted(() => ({
	refreshData: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = (await importOriginal()) as typeof import("react");
	return {
		...actual,
		useCallback: reactMocks.useCallback,
		useEffect: reactMocks.useEffect,
		useMemo: reactMocks.useMemo,
		useState: reactMocks.useState,
	};
});

vi.mock("react-native", () => ({
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
}));

vi.mock("@/components/AppButton", () => ({
	default: (props: any) => ({ type: "AppButton", props }),
}));
vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));
vi.mock("@/components/EmptyState", () => ({
	default: (props: any) => ({ type: "EmptyState", props }),
}));
vi.mock("@/components/GlassCard", () => ({
	default: (props: any) => ({ type: "GlassCard", props }),
}));
vi.mock("@/components/ListHeader", () => ({
	default: (props: any) => ({ type: "ListHeader", props }),
}));
vi.mock("@/components/Notice", () => ({
	default: (props: any) => ({ type: "Notice", props }),
}));
vi.mock("@/components/ScreenList", () => ({
	default: (props: any) => ({ type: "ScreenList", props }),
}));
vi.mock("@/components/TextField", () => ({
	default: (props: any) => ({ type: "TextField", props }),
}));

vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => ({
		database: { id: "db" },
		dataVersion: 1,
		refreshData: hookMocks.refreshData,
	}),
}));

vi.mock("@/services/exchangeRateService", () => ({
	default: {
		fetchExchangeRates: serviceMocks.fetchExchangeRates,
		getExchangeRates: serviceMocks.getExchangeRates,
		saveManualExchangeRate: serviceMocks.saveManualExchangeRate,
	},
}));
vi.mock("@/services/sourceService", () => ({
	default: {
		getSources: serviceMocks.getSources,
	},
}));

vi.mock("@/utils/date", () => ({
	default: {
		formatDateTime: (value: number) => `datetime:${value}`,
	},
}));
vi.mock("@/utils/money", () => ({
	default: {
		formatMoney: (amount: string, code: string) => `${code} ${amount}`,
	},
}));
vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/runAfterRender", () => ({
	default: (fn: () => void) => fn(),
}));

import ExchangeRatesScreen from "@/screens/ExchangeRatesScreen";

const flush = async (): Promise<void> => {
	await Promise.resolve();
	await Promise.resolve();
};

const findByPredicate = (
	node: any,
	predicate: (candidate: any) => boolean,
	acc: any[] = [],
): any[] => {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((child) => findByPredicate(child, predicate, acc));
		return acc;
	}
	if (predicate(node)) acc.push(node);
	if (node.props) {
		Object.values(node.props).forEach((value) =>
			findByPredicate(value, predicate, acc),
		);
	}
	return acc;
};

describe("ExchangeRatesScreen", () => {
	beforeEach(() => {
		reactMocks.useState.mockReset();
		reactMocks.useState.mockImplementation((initial: any) => [
			typeof initial === "function" ? initial() : initial,
			vi.fn(),
		]);
		Object.values(serviceMocks).forEach((mockFn) => mockFn.mockReset());
		hookMocks.refreshData.mockReset();
		serviceMocks.getSources.mockResolvedValue([
			{ currencyCode: "USD" },
			{ currencyCode: "INR" },
		]);
		serviceMocks.getExchangeRates.mockResolvedValue([
			{
				currencyCode: "USD",
				rateToInr: "83.5",
				source: "manual",
				fetchedAt: 1,
				updatedAt: 2,
			},
		]);
		serviceMocks.fetchExchangeRates.mockResolvedValue(1);
		serviceMocks.saveManualExchangeRate.mockResolvedValue(undefined);
	});

	it("covers list keyExtractor and draft updater callback", async () => {
		const setDrafts = vi.fn();
		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [["USD"], vi.fn()];
			if (call === 2)
				return [
					[
						{
							currencyCode: "USD",
							rateToInr: "83.5",
							source: "manual",
							fetchedAt: 1,
							updatedAt: 2,
						},
					],
					vi.fn(),
				];
			if (call === 3) return [{ USD: "84" }, setDrafts];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ExchangeRatesScreen({} as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.renderItem === "function" &&
				typeof node?.props?.keyExtractor === "function",
		)[0];
		expect(screenList.props.keyExtractor("USD")).toBe("USD");

		const row = screenList.props.renderItem({ item: "USD" });
		const textField = findByPredicate(
			row,
			(node) =>
				node?.props?.label === "Rate to INR" &&
				typeof node?.props?.onChangeText === "function",
		)[0];
		textField?.props?.onChangeText("99.10");
		expect(setDrafts).toHaveBeenCalled();

		const updater = setDrafts.mock.calls.at(-1)?.[0] as (
			current: Record<string, string>,
		) => Record<string, string>;
		expect(updater({ USD: "84", EUR: "91" })).toEqual({
			USD: "99.10",
			EUR: "91",
		});
	});

	it("covers load, fetch, and save error branches", async () => {
		const setError = vi.fn();
		serviceMocks.getSources.mockRejectedValueOnce(new Error("load failed"));
		serviceMocks.fetchExchangeRates.mockRejectedValueOnce(
			new Error("fetch failed"),
		);
		serviceMocks.saveManualExchangeRate.mockRejectedValueOnce(
			new Error("save failed"),
		);

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [["USD"], vi.fn()];
			if (call === 2)
				return [
					[
						{
							currencyCode: "USD",
							rateToInr: "83.5",
							source: "manual",
							fetchedAt: 1,
							updatedAt: 2,
						},
					],
					vi.fn(),
				];
			if (call === 3) return [{ USD: "84" }, vi.fn()];
			if (call === 5) return ["", setError];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ExchangeRatesScreen({} as any);
		await flush();
		expect(setError).toHaveBeenCalledWith("load failed");

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Fetch latest rates" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		expect(setError).toHaveBeenCalledWith("fetch failed");

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({ item: "USD" });
		findByPredicate(
			row,
			(node) =>
				node?.props?.label === "Save manual rate" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();
		expect(setError).toHaveBeenCalledWith("save failed");
	});

	it("shows no-currency fetch message when fetched count is zero", async () => {
		const setIsFetching = vi.fn();
		const setMessage = vi.fn();
		serviceMocks.fetchExchangeRates.mockResolvedValueOnce(0);

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [["USD"], vi.fn()];
			if (call === 2)
				return [
					[
						{
							currencyCode: "USD",
							rateToInr: "83.5",
							source: "manual",
							fetchedAt: 1,
							updatedAt: 2,
						},
					],
					vi.fn(),
				];
			if (call === 3) return [{ USD: "84" }, vi.fn()];
			if (call === 4) return [false, setIsFetching];
			if (call === 6) return ["", setMessage];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ExchangeRatesScreen({} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Fetch latest rates" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(setIsFetching).toHaveBeenCalledWith(true);
		expect(setMessage).toHaveBeenCalledWith(
			"No foreign source currencies found.",
		);
	});

	it("shows updated-count message and refreshes after successful fetch", async () => {
		const setMessage = vi.fn();
		serviceMocks.fetchExchangeRates.mockResolvedValueOnce(2);

		let call = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			call += 1;
			if (call === 1) return [["USD"], vi.fn()];
			if (call === 2)
				return [
					[
						{
							currencyCode: "USD",
							rateToInr: "83.5",
							source: "manual",
							fetchedAt: 1,
							updatedAt: 2,
						},
					],
					vi.fn(),
				];
			if (call === 3) return [{ USD: "84" }, vi.fn()];
			if (call === 6) return ["", setMessage];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = ExchangeRatesScreen({} as any);
		await flush();

		findByPredicate(
			tree,
			(node) =>
				node?.props?.label === "Fetch latest rates" &&
				typeof node?.props?.onPress === "function",
		)[0]?.props?.onPress();
		await flush();

		expect(setMessage).toHaveBeenCalledWith("Updated 2 exchange rates.");
		expect(hookMocks.refreshData).toHaveBeenCalled();
	});
});
