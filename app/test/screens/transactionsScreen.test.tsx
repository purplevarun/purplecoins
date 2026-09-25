import AppButton from "@/components/AppButton";
import CustomText from "@/components/CustomText";
import FloatingAddButton from "@/components/FloatingAddButton";
import HeaderIconButton from "@/components/HeaderIconButton";
import ScreenList from "@/components/ScreenList";
import type AppButtonProps from "@/types/AppButtonProps";
import type ScreenListProps from "@/types/ScreenListProps";
import type Transaction from "@/types/Transaction";
import type Page from "@/types/TransactionPage";
import type TransactionsScreenProps from "@/types/TransactionsScreenProps";
import type HeaderOptions from "@test/types/HeaderOptions";
import type Harness from "@test/types/TransactionListHarness";
import {
	isValidElement,
	type ComponentProps,
	type EffectCallback,
	type ReactElement,
} from "react";
import type { PressableProps } from "react-native";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: any) => fn),
	useEffect: vi.fn(),
	useLayoutEffect: vi.fn(),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useRef: vi.fn((initial: unknown) => ({ current: initial })),
	useState: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
	getTransactions: vi.fn(),
	getTransactionPage: vi.fn(),
	getTransactionDisplayReason: vi.fn(),
}));

const databaseMocks = vi.hoisted(() => ({
	database: { id: "db" },
	dataVersion: 1,
}));
const renderMocks = vi.hoisted(() => ({
	cancel: vi.fn(),
	runAfterRender: vi.fn<(callback: () => void) => () => void>(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react")>();
	return {
		...actual,
		useCallback: reactMocks.useCallback,
		useEffect: reactMocks.useEffect,
		useLayoutEffect: reactMocks.useLayoutEffect,
		useMemo: reactMocks.useMemo,
		useRef: reactMocks.useRef,
		useState: reactMocks.useState,
	};
});

vi.mock("react-native", () => ({
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
	Pressable: (props: any) => ({ type: "Pressable", props }),
	ActivityIndicator: (props: unknown) => ({
		type: "ActivityIndicator",
		props,
	}),
}));
vi.mock("@expo/vector-icons", () => ({
	Ionicons: (props: any) => ({ type: "Ionicons", props }),
}));

vi.mock("@/components/AppButton", () => ({
	default: (props: unknown) => ({ type: "AppButton", props }),
}));
vi.mock("@/components/EmptyState", () => ({
	default: (props: any) => ({ type: "EmptyState", props }),
}));
vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));
vi.mock("@/components/FloatingAddButton", () => ({
	default: (props: any) => ({ type: "FloatingAddButton", props }),
}));
vi.mock("@/components/HeaderIconButton", () => ({
	default: (props: any) => ({ type: "HeaderIconButton", props }),
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
vi.mock("@/components/SearchBar", () => ({
	default: (props: any) => ({ type: "SearchBar", props }),
}));
vi.mock("@/components/SegmentedControl", () => ({
	default: (props: any) => ({ type: "SegmentedControl", props }),
}));
vi.mock("@/components/TransactionCard", () => ({
	default: (props: any) => ({ type: "TransactionCard", props }),
}));

vi.mock("@/hooks/useDatabaseContext", () => ({
	default: () => databaseMocks,
}));

vi.mock("@/services/transactionService", () => ({
	default: {
		getTransactions: serviceMocks.getTransactions,
		getTransactionPage: serviceMocks.getTransactionPage,
		getTransactionDisplayReason: serviceMocks.getTransactionDisplayReason,
	},
}));

vi.mock("@/utils/date", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/utils/date")>();
	return {
		default: {
			...actual.default,
			formatDate: (value: number) => `date:${value}`,
		},
	};
});
vi.mock("@/utils/error", () => ({
	default: (caughtError: unknown) =>
		caughtError instanceof Error ? caughtError.message : "Unknown error",
}));
vi.mock("@/utils/money", () => ({
	default: {
		formatMoney: (amount: string, currency: string) =>
			`${currency} ${amount}`,
	},
}));
vi.mock("@/utils/runAfterRender", () => ({
	default: renderMocks.runAfterRender,
}));

import TransactionsScreen from "@/screens/TransactionsScreen";

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

describe("TransactionsScreen", () => {
	beforeEach(() => {
		databaseMocks.dataVersion = 1;
		renderMocks.cancel.mockReset();
		renderMocks.runAfterRender.mockReset();
		renderMocks.runAfterRender.mockImplementation((callback) => {
			callback();
			return renderMocks.cancel;
		});
		vi.spyOn(globalThis, "setTimeout").mockImplementation(((fn: any) => {
			fn();
			return 0;
		}) as any);
		vi.spyOn(globalThis, "clearTimeout").mockImplementation(() => {});

		reactMocks.useEffect.mockReset();
		reactMocks.useLayoutEffect.mockReset();
		reactMocks.useState.mockReset();
		reactMocks.useRef.mockReset();
		reactMocks.useRef.mockImplementation((initial: unknown) => ({
			current: initial,
		}));
		reactMocks.useEffect.mockImplementation((effect: EffectCallback) => {
			effect();
		});
		reactMocks.useLayoutEffect.mockImplementation(
			(effect: EffectCallback) => {
				effect();
			},
		);
		reactMocks.useState.mockImplementation((initial: any) => [
			typeof initial === "function" ? initial() : initial,
			vi.fn(),
		]);

		serviceMocks.getTransactions.mockReset();
		serviceMocks.getTransactionPage.mockReset();
		serviceMocks.getTransactionPage.mockResolvedValue({
			transactions: [],
			hasMore: false,
		});
		serviceMocks.getTransactionDisplayReason.mockReset();
		serviceMocks.getTransactions.mockResolvedValue([
			{
				id: "t1",
				classification: "GENERAL",
				amount: "100",
				sourceName: "Cash",
				sourceCurrencyCode: "INR",
				transactionAt: 10,
				reason: "Lunch",
			},
			{
				id: "t2",
				classification: "INVESTMENT",
				amount: "200",
				sourceName: "Broker",
				sourceCurrencyCode: "INR",
				transactionAt: 20,
				reason: "SIP",
			},
		]);
		serviceMocks.getTransactionDisplayReason.mockImplementation(
			(transaction: any) => transaction.reason,
		);
	});

	describe("count-based paging lifecycle", () => {
		const anchor = new Date(2026, 8, 15, 14, 30);
		const dayRange = {
			start: new Date(2026, 8, 15).getTime(),
			end: new Date(2026, 8, 15, 23, 59, 59, 999).getTime(),
		};
		const recent: Transaction = {
			items: [],
			id: "00000000-0000-4000-8000-000000000001",
			classification: "GENERAL",
			type: "DEBIT",
			sourceId: "00000000-0000-4000-8000-000000000002",
			destinationSourceId: null,
			amount: "100",
			toAmount: null,
			categoryId: null,
			tripId: null,
			investmentId: null,
			reason: "Lunch",
			transactionAt: anchor.getTime(),
			createdAt: anchor.getTime(),
			updatedAt: anchor.getTime(),
			sourceName: "Cash",
			sourceCurrencyCode: "INR",
			destinationSourceName: null,
			destinationCurrencyCode: null,
			categoryName: null,
			tripName: null,
			investmentName: null,
			hasAttachment: false,
		};
		const older: Transaction = {
			...recent,
			id: "00000000-0000-4000-8000-000000000003",
			createdAt: recent.createdAt - 1,
			transactionAt: new Date(2020, 0, 1).getTime(),
		};
		const history: readonly Transaction[] = Array.from(
			{ length: 25 },
			(_, index) => ({
				...recent,
				id: `00000000-0000-4000-8000-${String(100 - index).padStart(12, "0")}`,
				createdAt: recent.createdAt - Math.floor(index / 3),
				transactionAt: new Date(2010 + index, 0, 1).getTime(),
			}),
		);
		const firstPage = history.slice(0, 10);
		const secondPage = history.slice(10, 20);
		const lastPage = history.slice(20);

		const elements = <Props,>(
			tree: unknown,
			component: unknown,
		): ReactElement<Props>[] =>
			findByPredicate(
				tree,
				(node: unknown) =>
					isValidElement(node) && node.type === component,
			) as ReactElement<Props>[];

		const listProps = (
			tree: ReactElement,
		): ScreenListProps<Transaction> => {
			const [list] = elements<ScreenListProps<Transaction>>(
				tree,
				ScreenList,
			);
			if (!list) throw new Error("Expected transaction list");
			return list.props;
		};

		const footerButton = (
			tree: ReactElement,
		): ComponentProps<typeof AppButton> => {
			const [button] = elements<ComponentProps<typeof AppButton>>(
				tree,
				AppButton,
			);
			if (!button) throw new Error("Expected footer button");
			return button.props;
		};

		const dayButton = (
			tree: ReactElement,
			label: string,
		):
			| ReactElement<
					Pick<PressableProps, "disabled"> &
						Pick<AppButtonProps, "onPress">
			  >
			| undefined =>
			(
				findByPredicate(
					tree,
					(node: unknown) =>
						isValidElement<
							Pick<PressableProps, "accessibilityLabel">
						>(node) && node.props.accessibilityLabel === label,
				) as ReactElement<
					Pick<PressableProps, "disabled"> &
						Pick<AppButtonProps, "onPress">
				>[]
			)[0];

		const createHarness = (mode?: "DAY" | "SCROLL"): Harness => {
			const states = new Map<number, unknown>([[6, anchor]]);
			if (mode) states.set(7, mode);
			const effects: EffectCallback[] = [];
			const setOptions = vi.fn<(options: HeaderOptions) => void>();
			let stateIndex = 0;
			let cleanup: (() => void) | undefined;
			reactMocks.useRef.mockReturnValue({
				current: { requestId: 0, loading: false, cursor: undefined },
			});
			reactMocks.useEffect.mockImplementation(
				(effect: EffectCallback) => {
					effects.push(effect);
				},
			);
			reactMocks.useState.mockImplementation((initial: unknown) => {
				const index = stateIndex++;
				if (!states.has(index)) {
					states.set(
						index,
						typeof initial === "function"
							? (initial as () => unknown)()
							: initial,
					);
				}
				return [
					states.get(index),
					(update: unknown): void => {
						states.set(
							index,
							typeof update === "function"
								? (update as (current: unknown) => unknown)(
										states.get(index),
									)
								: update,
						);
					},
				];
			});
			return {
				render: () => {
					stateIndex = 0;
					effects.length = 0;
					return TransactionsScreen({
						navigation: { navigate: vi.fn(), setOptions },
					} as unknown as TransactionsScreenProps);
				},
				reload: () => {
					cleanup?.();
					const result = effects[0]?.();
					cleanup = typeof result === "function" ? result : undefined;
				},
				unmount: () => {
					cleanup?.();
				},
				headerButtons: () =>
					elements<ComponentProps<typeof HeaderIconButton>>(
						setOptions.mock.calls.at(-1)?.[0].headerRight(),
						HeaderIconButton,
					),
				setState: (index, value) => {
					states.set(index, value);
				},
			};
		};

		beforeEach(() => {
			vi.useFakeTimers({ toFake: ["Date"] });
			vi.setSystemTime(anchor);
		});
		afterEach(() => {
			vi.useRealTimers();
		});

		it("defaults to scroll and appends ten transactions at a time regardless of their dates", async () => {
			serviceMocks.getTransactionPage
				.mockResolvedValueOnce({
					transactions: firstPage,
					hasMore: true,
				})
				.mockResolvedValueOnce({
					transactions: secondPage,
					hasMore: true,
				})
				.mockResolvedValueOnce({
					transactions: lastPage,
					hasMore: false,
				});
			const harness = createHarness();
			const initial = harness.render();
			expect(listProps(initial).ListEmptyComponent).toBeNull();
			expect(harness.headerButtons()[0]?.props.accessibilityLabel).toBe(
				"Switch to day view",
			);
			expect(
				elements(listProps(initial).ListHeaderComponent, CustomText),
			).toHaveLength(0);
			harness.reload();
			await flush();
			const first = harness.render();
			expect(listProps(first).data).toEqual(firstPage);
			expect(serviceMocks.getTransactions).not.toHaveBeenCalled();
			expect(
				serviceMocks.getTransactionPage,
			).toHaveBeenCalledExactlyOnceWith({ id: "db" }, undefined);
			expect(dayButton(first, "Previous day")).toBeUndefined();
			const button = footerButton(first);
			expect(button.label).toBe("Load more");
			button.onPress();
			button.onPress();
			expect(serviceMocks.getTransactionPage).toHaveBeenCalledTimes(2);
			expect(elements(harness.render(), AppButton)).toHaveLength(0);
			await flush();
			const second = harness.render();
			expect(listProps(second).data).toEqual([
				...firstPage,
				...secondPage,
			]);
			expect(footerButton(second).label).toBe("Load more");
			footerButton(second).onPress();
			await flush();
			const last = harness.render();
			expect(listProps(last).data).toEqual(history);
			expect(serviceMocks.getTransactionPage.mock.calls).toEqual([
				[{ id: "db" }, undefined],
				[{ id: "db" }, firstPage.at(-1)],
				[{ id: "db" }, secondPage.at(-1)],
			]);
			expect(elements(last, AppButton)).toHaveLength(0);
			const headerTexts = elements<ComponentProps<typeof CustomText>>(
				listProps(last).ListHeaderComponent,
				CustomText,
			);
			const footerTexts = elements<ComponentProps<typeof CustomText>>(
				listProps(last).ListFooterComponent,
				CustomText,
			);
			expect(headerTexts).toHaveLength(0);
			expect(footerTexts[0]?.props.children).toBe(
				"No older transactions",
			);
			expect(elements(last, ScreenList)[0]?.key).toBe(
				elements(first, ScreenList)[0]?.key,
			);
		});

		it.each([0, 1, 9, 10])(
			"hides Load more when the final result contains %i transactions",
			async (count) => {
				const transactions = history.slice(0, count);
				serviceMocks.getTransactionPage.mockResolvedValueOnce({
					transactions,
					hasMore: false,
				});
				const harness = createHarness();
				harness.render();
				harness.reload();
				await flush();
				const tree = harness.render();
				expect(listProps(tree).data).toEqual(transactions);
				expect(listProps(tree).ListEmptyComponent).not.toBeNull();
				expect(elements(tree, AppButton)).toHaveLength(0);
				expect(
					serviceMocks.getTransactionPage,
				).toHaveBeenCalledExactlyOnceWith({ id: "db" }, undefined);
			},
		);

		it.each(["DAY", "SCROLL"] as const)(
			"retries the same initial %s query after failure",
			async (mode) => {
				const query =
					mode === "DAY"
						? serviceMocks.getTransactions
						: serviceMocks.getTransactionPage;
				query
					.mockRejectedValueOnce(new Error("initial failed"))
					.mockResolvedValueOnce(
						mode === "DAY"
							? [recent]
							: { transactions: [recent], hasMore: false },
					);
				const harness = createHarness(mode);
				harness.render();
				harness.reload();
				await flush();
				const failed = harness.render();
				expect(listProps(failed).ListEmptyComponent).toBeNull();
				expect(footerButton(failed).label).toBe("Retry");
				footerButton(failed).onPress();
				await flush();
				expect(query.mock.calls[1]).toEqual(query.mock.calls[0]);
				expect(listProps(harness.render()).data).toEqual([recent]);
				expect(elements(harness.render(), AppButton)).toHaveLength(0);
			},
		);

		it("retries a failed page without losing rows or advancing its cursor", async () => {
			serviceMocks.getTransactionPage
				.mockResolvedValueOnce({
					transactions: [recent],
					hasMore: true,
				})
				.mockRejectedValueOnce(new Error("next page failed"))
				.mockResolvedValueOnce({
					transactions: [older],
					hasMore: false,
				});
			const harness = createHarness();
			harness.render();
			harness.reload();
			await flush();
			footerButton(harness.render()).onPress();
			await flush();
			const failed = harness.render();
			expect(listProps(failed).data).toEqual([recent]);
			expect(footerButton(failed).label).toBe("Retry");
			footerButton(failed).onPress();
			await flush();
			expect(serviceMocks.getTransactionPage.mock.calls[1]).toEqual([
				{ id: "db" },
				recent,
			]);
			expect(serviceMocks.getTransactionPage.mock.calls[2]).toEqual(
				serviceMocks.getTransactionPage.mock.calls[1],
			);
			expect(listProps(harness.render()).data).toEqual([recent, older]);
		});

		it("resets paging on mode switches while keeping the selected day and filters", async () => {
			serviceMocks.getTransactionPage
				.mockResolvedValueOnce({
					transactions: [recent],
					hasMore: true,
				})
				.mockResolvedValueOnce({ transactions: [older], hasMore: true })
				.mockResolvedValueOnce({
					transactions: [recent],
					hasMore: false,
				});
			serviceMocks.getTransactions.mockResolvedValueOnce([recent]);
			const harness = createHarness();
			harness.setState(1, "GENERAL");
			harness.setState(5, "lunch");
			harness.render();
			harness.reload();
			await flush();
			footerButton(harness.render()).onPress();
			await flush();
			const scroll = harness.render();
			harness.headerButtons()[0]?.props.onPress();
			const day = harness.render();
			expect(elements(day, ScreenList)[0]?.key).not.toBe(
				elements(scroll, ScreenList)[0]?.key,
			);
			harness.reload();
			await flush();
			expect(listProps(harness.render()).data).toEqual([recent]);
			expect(
				serviceMocks.getTransactions,
			).toHaveBeenCalledExactlyOnceWith(
				{ id: "db" },
				{
					start: new Date(2026, 8, 15).getTime(),
					end: dayRange.end,
				},
			);
			harness.headerButtons()[0]?.props.onPress();
			harness.render();
			harness.reload();
			await flush();
			expect(serviceMocks.getTransactionPage).toHaveBeenLastCalledWith(
				{ id: "db" },
				undefined,
			);
			expect(listProps(harness.render()).data).toEqual([recent]);
		});

		it("refreshes only the first page when database data changes", async () => {
			serviceMocks.getTransactionPage
				.mockResolvedValueOnce({
					transactions: [recent],
					hasMore: true,
				})
				.mockResolvedValueOnce({ transactions: [older], hasMore: true })
				.mockResolvedValueOnce({ transactions: [], hasMore: false });
			const harness = createHarness();
			harness.render();
			harness.reload();
			await flush();
			footerButton(harness.render()).onPress();
			await flush();
			databaseMocks.dataVersion += 1;
			harness.render();
			harness.reload();
			await flush();
			expect(serviceMocks.getTransactionPage).toHaveBeenLastCalledWith(
				{ id: "db" },
				undefined,
			);
			expect(listProps(harness.render()).data).toEqual([]);
		});

		it.each(["resolve", "reject"] as const)(
			"ignores a late %s after switching mode while the new query is pending",
			async (settlement) => {
				let resolvePage: ((page: Page) => void) | undefined;
				let rejectPage: ((error: Error) => void) | undefined;
				let resolveDay:
					| ((transactions: readonly Transaction[]) => void)
					| undefined;
				serviceMocks.getTransactionPage.mockReturnValueOnce(
					new Promise<Page>((resolve, reject) => {
						resolvePage = resolve;
						rejectPage = reject;
					}),
				);
				serviceMocks.getTransactions.mockReturnValueOnce(
					new Promise<readonly Transaction[]>((resolve) => {
						resolveDay = resolve;
					}),
				);
				const harness = createHarness();
				harness.render();
				harness.reload();
				harness.headerButtons()[0]?.props.onPress();
				harness.render();
				harness.reload();
				if (settlement === "resolve")
					resolvePage?.({ transactions: [older], hasMore: true });
				else rejectPage?.(new Error("stale error"));
				await flush();
				const pending = harness.render();
				expect(listProps(pending).data).toEqual([]);
				expect(listProps(pending).ListEmptyComponent).toBeNull();
				expect(elements(pending, AppButton)).toHaveLength(0);
				resolveDay?.([recent]);
				await flush();
				expect(listProps(harness.render()).data).toEqual([recent]);
				expect(elements(harness.render(), AppButton)).toHaveLength(0);
			},
		);

		it.each(["resolve", "reject"] as const)(
			"ignores a late %s after unmount",
			async (settlement) => {
				let resolvePage: ((page: Page) => void) | undefined;
				let rejectPage: ((error: Error) => void) | undefined;
				serviceMocks.getTransactionPage.mockReturnValueOnce(
					new Promise<Page>((resolve, reject) => {
						resolvePage = resolve;
						rejectPage = reject;
					}),
				);
				const harness = createHarness();
				harness.render();
				harness.reload();
				harness.unmount();
				if (settlement === "resolve")
					resolvePage?.({ transactions: [recent], hasMore: true });
				else rejectPage?.(new Error("unmounted error"));
				await flush();
				expect(listProps(harness.render()).data).toEqual([]);
				expect(elements(harness.render(), AppButton)).toHaveLength(0);
				expect(renderMocks.cancel).toHaveBeenCalledOnce();
			},
		);

		it("cancels a scheduled query before it starts", () => {
			renderMocks.runAfterRender.mockImplementationOnce(
				() => renderMocks.cancel,
			);
			const harness = createHarness();
			harness.render();
			harness.reload();
			harness.unmount();
			expect(serviceMocks.getTransactionPage).not.toHaveBeenCalled();
			expect(renderMocks.cancel).toHaveBeenCalledOnce();
		});

		it.each([false, true])(
			"switches to day view without accessing a scroll cursor, hasTransactions=%s",
			async (hasTransactions) => {
				const dayTransactions = hasTransactions ? [recent] : [];
				const readCursor = vi
					.spyOn(dayTransactions, "at")
					.mockImplementation(() => {
						throw new Error(
							"Day view must not access a scroll cursor",
						);
					});
				serviceMocks.getTransactionPage.mockResolvedValueOnce({
					transactions: [older],
					hasMore: true,
				});
				serviceMocks.getTransactions.mockResolvedValueOnce(
					dayTransactions,
				);
				const harness = createHarness();
				harness.render();
				harness.reload();
				await flush();
				harness.headerButtons()[0]?.props.onPress();
				harness.render();
				harness.reload();
				await flush();

				const day = harness.render();
				expect(
					serviceMocks.getTransactions,
				).toHaveBeenCalledExactlyOnceWith({ id: "db" }, dayRange);
				expect(readCursor).not.toHaveBeenCalled();
				expect(listProps(day).data).toEqual(dayTransactions);
				expect(elements(day, AppButton)).toHaveLength(0);
				expect(dayButton(day, "Next day")?.props.disabled).toBe(true);
				expect(
					reactMocks.useRef.mock.results.at(-1)?.value,
				).toMatchObject({ current: { cursor: undefined } });
				readCursor.mockRestore();
			},
		);

		it("queries adjacent days and disables next-day navigation at today", async () => {
			const harness = createHarness("DAY");
			const today = harness.render();
			expect(dayButton(today, "Next day")?.props.disabled).toBe(true);
			expect(
				elements<ComponentProps<typeof CustomText>>(
					listProps(today).ListHeaderComponent,
					CustomText,
				)[0]?.props.children,
			).toBe(`date:${new Date(2026, 8, 15).getTime()}`);
			harness.reload();
			await flush();
			dayButton(today, "Previous day")?.props.onPress();
			const yesterday = harness.render();
			expect(dayButton(yesterday, "Next day")?.props.disabled).toBe(
				false,
			);
			harness.reload();
			await flush();
			expect(serviceMocks.getTransactions).toHaveBeenLastCalledWith(
				{ id: "db" },
				{
					start: new Date(2026, 8, 14).getTime(),
					end: new Date(2026, 8, 14, 23, 59, 59, 999).getTime(),
				},
			);
			dayButton(yesterday, "Next day")?.props.onPress();
			harness.render();
			harness.reload();
			await flush();
			expect(serviceMocks.getTransactions).toHaveBeenLastCalledWith(
				{ id: "db" },
				{
					start: new Date(2026, 8, 15).getTime(),
					end: dayRange.end,
				},
			);
			expect(serviceMocks.getTransactionPage).not.toHaveBeenCalled();
		});

		it("falls back to today if the selected date is unavailable", async () => {
			const harness = createHarness("DAY");
			harness.setState(6, undefined);
			harness.render();
			harness.reload();
			await flush();
			expect(
				serviceMocks.getTransactions,
			).toHaveBeenCalledExactlyOnceWith(
				{ id: "db" },
				{
					start: new Date(2026, 8, 15).getTime(),
					end: dayRange.end,
				},
			);
		});
	});

	it("loads transactions and executes navigation actions", async () => {
		const setOptions = vi.fn();
		const navigation = { navigate: vi.fn(), setOptions };

		const tree = TransactionsScreen({ navigation } as any);
		await flush();

		expect(serviceMocks.getTransactionPage).toHaveBeenCalledWith(
			{ id: "db" },
			undefined,
		);
		expect(setOptions).toHaveBeenCalled();

		const headerRight = setOptions.mock.calls[0]?.[0].headerRight;
		const [headerButton] = findByPredicate(
			headerRight(),
			(node: unknown) =>
				isValidElement<ComponentProps<typeof HeaderIconButton>>(node) &&
				node.props.accessibilityLabel === "Search",
		) as ReactElement<ComponentProps<typeof HeaderIconButton>>[];
		headerButton?.props.onPress();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		const row = screenList.props.renderItem({
			item: {
				id: "t1",
				classification: "GENERAL",
				amount: "100",
				sourceName: "Cash",
				sourceCurrencyCode: "INR",
				transactionAt: 10,
				reason: "Lunch",
			},
		});
		const card = findByPredicate(
			row,
			(node) => typeof node?.props?.onPress === "function",
		)[0];
		card.props.onPress();
		card.props.onLongPress();

		const plainPressables = findByPredicate(
			tree,
			(node) =>
				typeof node?.props?.onPress === "function" &&
				typeof node?.props?.onLongPress !== "function",
		);
		plainPressables.at(-1)?.props?.onPress();

		expect(navigation.navigate).toHaveBeenCalledWith("TransactionForm", {
			transactionId: "t1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("TransactionForm", {
			cloneFromTransactionId: "t1",
		});
		expect(navigation.navigate).toHaveBeenCalledWith("TransactionForm", {
			initialTransactionAt: expect.any(Number),
		});
	});

	it.each([
		{ day: "August 24", selectedDate: new Date(2026, 7, 24, 14, 30) },
		{ day: "today", selectedDate: new Date() },
	])(
		"passes $day from the list to a new transaction",
		async ({ selectedDate }) => {
			const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
			let stateCall = 0;
			reactMocks.useState.mockImplementation((initial: unknown) => {
				stateCall += 1;
				if (stateCall === 7) return [selectedDate, vi.fn()];
				return [
					typeof initial === "function"
						? (initial as () => unknown)()
						: initial,
					vi.fn(),
				];
			});
			const renderScreen = TransactionsScreen as (
				props: unknown,
			) => ReactElement;
			const tree = renderScreen({ navigation });
			await flush();
			const [addButton] = findByPredicate(
				tree,
				(node: unknown) =>
					isValidElement(node) && node.type === FloatingAddButton,
			) as ReactElement<ComponentProps<typeof FloatingAddButton>>[];

			addButton?.props.onPress();

			expect(navigation.navigate).toHaveBeenCalledWith(
				"TransactionForm",
				{
					initialTransactionAt: selectedDate.getTime(),
				},
			);
		},
	);

	it("covers debounced search timer callback execution", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		const setSearchDebounced = vi.fn();
		const clearSpy = vi.spyOn(globalThis, "clearTimeout");

		reactMocks.useEffect.mockImplementation((effect: EffectCallback) => {
			const cleanup = effect();
			if (typeof cleanup === "function") cleanup();
		});

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 6) return ["cash", setSearchDebounced];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		TransactionsScreen({ navigation } as any);
		await flush();

		expect(setSearchDebounced).toHaveBeenCalledWith("");
		expect(clearSpy).toHaveBeenCalled();
	});

	it("covers header search toggle updater callback", async () => {
		const setOptions = vi.fn();
		const setSearchVisible = vi.fn();
		const navigation = { navigate: vi.fn(), setOptions };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 4) return [false, setSearchVisible];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		TransactionsScreen({ navigation } as any);
		await flush();

		const headerRight = setOptions.mock.calls[0]?.[0]?.headerRight;
		const [headerButton] = findByPredicate(
			headerRight?.(),
			(node: unknown) =>
				isValidElement<ComponentProps<typeof HeaderIconButton>>(node) &&
				node.props.accessibilityLabel === "Search",
		) as ReactElement<ComponentProps<typeof HeaderIconButton>>[];
		headerButton?.props.onPress();

		const updater = setSearchVisible.mock.calls[0]?.[0] as (
			current: boolean,
		) => boolean;
		expect(updater(true)).toBe(false);
	});

	it.each(["DAY", "SCROLL"] as const)(
		"places the %s toggle left of search and uses the appropriate query",
		async (mode) => {
			const selectedDate = new Date(2026, 8, 15, 14, 30);
			const setMode =
				vi.fn<
					(
						update: (current: "DAY" | "SCROLL") => "DAY" | "SCROLL",
					) => void
				>();
			const setOptions = vi.fn<(options: HeaderOptions) => void>();
			const navigation = { navigate: vi.fn(), setOptions };
			let stateCall = 0;
			reactMocks.useState.mockImplementation((initial: unknown) => {
				stateCall += 1;
				if (stateCall === 7) return [selectedDate, vi.fn()];
				if (stateCall === 8) return [mode, setMode];
				return [
					typeof initial === "function"
						? (initial as () => unknown)()
						: initial,
					vi.fn(),
				];
			});

			TransactionsScreen({
				navigation,
			} as unknown as TransactionsScreenProps);
			await flush();
			const header = setOptions.mock.calls[0]?.[0].headerRight();
			const [toggle, search] = findByPredicate(
				header,
				(node: unknown) =>
					isValidElement(node) && node.type === HeaderIconButton,
			) as ReactElement<ComponentProps<typeof HeaderIconButton>>[];
			expect(toggle?.props.accessibilityLabel).toBe(
				mode === "DAY" ? "Switch to scroll view" : "Switch to day view",
			);
			expect(toggle?.props.icon).toBe(
				mode === "DAY" ? "list-outline" : "calendar-outline",
			);
			expect(toggle?.props.isActive).toBe(mode === "SCROLL");
			expect(search?.props.accessibilityLabel).toBe("Search");
			toggle?.props.onPress();
			expect(setMode.mock.calls[0]?.[0](mode)).toBe(
				mode === "DAY" ? "SCROLL" : "DAY",
			);

			const query =
				mode === "DAY"
					? serviceMocks.getTransactions
					: serviceMocks.getTransactionPage;
			const otherQuery =
				mode === "DAY"
					? serviceMocks.getTransactionPage
					: serviceMocks.getTransactions;
			expect(query).toHaveBeenCalledExactlyOnceWith(
				{ id: "db" },
				mode === "DAY"
					? {
							start: new Date(2026, 8, 15).getTime(),
							end: new Date(
								2026,
								8,
								15,
								23,
								59,
								59,
								999,
							).getTime(),
						}
					: undefined,
			);
			expect(otherQuery).not.toHaveBeenCalled();
		},
	);

	it("applies classification and search filters", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "t1",
							classification: "GENERAL",
							amount: "100",
							sourceName: "Cash",
							sourceCurrencyCode: "INR",
							transactionAt: 10,
							reason: "Lunch",
						},
						{
							id: "t2",
							classification: "INVESTMENT",
							amount: "200",
							sourceName: "Broker",
							sourceCurrencyCode: "INR",
							transactionAt: 20,
							reason: "SIP",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["GENERAL", vi.fn()];
			if (stateCall === 4) return [true, vi.fn()];
			if (stateCall === 6) return ["lun", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionsScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(screenList.props.data).toHaveLength(1);
		expect(screenList.props.data[0].id).toBe("t1");
	});

	it("covers search cleanup, load error branch, and list key extractor", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };
		const clearSpy = vi.spyOn(globalThis, "clearTimeout");
		serviceMocks.getTransactionPage.mockRejectedValueOnce(
			new Error("load failed"),
		);

		reactMocks.useEffect.mockImplementation((effect: EffectCallback) => {
			const cleanup = effect();
			if (typeof cleanup === "function") {
				cleanup();
			}
		});

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "t1",
							classification: "GENERAL",
							amount: "100",
							sourceName: "Cash",
							sourceCurrencyCode: "INR",
							transactionAt: 10,
							reason: "Lunch",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["ALL", vi.fn()];
			if (stateCall === 3) return ["load failed", vi.fn()];
			if (stateCall === 4) return [true, vi.fn()];
			if (stateCall === 5) return ["cash", vi.fn()];
			if (stateCall === 6) return ["cash", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionsScreen({ navigation } as any);
		await flush();

		expect(serviceMocks.getTransactionPage).toHaveBeenCalledWith(
			{ id: "db" },
			undefined,
		);
		expect(clearSpy).toHaveBeenCalled();
		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.placeholder === "Search transactions...",
			),
		).not.toHaveLength(0);
		expect(
			findByPredicate(
				tree,
				(node) => node?.props?.message === "load failed",
			),
		).not.toHaveLength(0);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.renderItem === "function",
		)[0];
		expect(screenList.props.keyExtractor({ id: "t1" })).toBe("t1");
	});

	it("covers search match branches beyond reason text", async () => {
		const navigation = { navigate: vi.fn(), setOptions: vi.fn() };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "t2",
							classification: "GENERAL",
							amount: "200",
							sourceName: "Wallet",
							sourceCurrencyCode: "INR",
							transactionAt: 20,
							reason: "No match",
							categoryName: "Groceries",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["ALL", vi.fn()];
			if (stateCall === 4) return [true, vi.fn()];
			if (stateCall === 6) return ["wallet", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionsScreen({ navigation } as any);
		await flush();

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(screenList.props.data).toHaveLength(1);
		expect(screenList.props.data[0].id).toBe("t2");
	});

	it.each([
		["amount", "2000", { amount: "2,000" }],
		["category", "gro", { categoryName: "Groceries" }],
		[
			"item category",
			"gro",
			{ items: [{ categoryName: "Grocery", amount: "75" }] },
		],
		[
			"item amount",
			"75",
			{ items: [{ categoryName: "Food", amount: "75" }] },
		],
		[
			"item formatted amount",
			"usd 75",
			{ items: [{ categoryName: "Food", amount: "75" }] },
		],
		["trip", "goa", { tripName: "Goa" }],
		["investment", "mf", { investmentName: "MF" }],
		["date", "date:45", { transactionAt: 45 }],
		[
			"formatted money",
			"inr 2000",
			{ amount: "2,000", sourceCurrencyCode: "inr" },
		],
	] as const)(
		"covers search match branch: %s",
		async (_label, query, overrides) => {
			const navigation = { navigate: vi.fn(), setOptions: vi.fn() };

			let stateCall = 0;
			reactMocks.useState.mockImplementation((initial: any) => {
				stateCall += 1;
				if (stateCall === 1) {
					return [
						[
							{
								id: "t-branch",
								items: [],
								classification: "GENERAL",
								amount: "100",
								sourceName: "Wallet",
								sourceCurrencyCode: "USD",
								transactionAt: 20,
								reason: "alpha",
								...overrides,
							},
						],
						vi.fn(),
					];
				}
				if (stateCall === 2) return ["ALL", vi.fn()];
				if (stateCall === 4) return [true, vi.fn()];
				if (stateCall === 6) return [query, vi.fn()];
				return [
					typeof initial === "function" ? initial() : initial,
					vi.fn(),
				];
			});

			const tree = TransactionsScreen({ navigation } as any);
			await flush();

			const screenList = findByPredicate(
				tree,
				(node) => typeof node?.props?.data !== "undefined",
			)[0];
			expect(screenList.props.data).toHaveLength(1);
			expect(screenList.props.data[0].id).toBe("t-branch");
		},
	);

	it("covers search no-match branch and close-search header icon branch", async () => {
		const setOptions = vi.fn();
		const navigation = { navigate: vi.fn(), setOptions };

		let stateCall = 0;
		reactMocks.useState.mockImplementation((initial: any) => {
			stateCall += 1;
			if (stateCall === 1) {
				return [
					[
						{
							id: "t-none",
							items: [],
							classification: "GENERAL",
							amount: "100",
							sourceName: "Wallet",
							sourceCurrencyCode: "USD",
							transactionAt: 20,
							reason: "alpha",
						},
					],
					vi.fn(),
				];
			}
			if (stateCall === 2) return ["ALL", vi.fn()];
			if (stateCall === 4) return [true, vi.fn()];
			if (stateCall === 6) return ["zzz", vi.fn()];
			return [
				typeof initial === "function" ? initial() : initial,
				vi.fn(),
			];
		});

		const tree = TransactionsScreen({ navigation } as any);
		await flush();

		const headerRight = setOptions.mock.calls[0]?.[0].headerRight;
		const header = headerRight();
		expect(
			findByPredicate(
				header,
				(node) =>
					node?.props?.accessibilityLabel === "Close search" &&
					node?.props?.icon === "close-outline",
			),
		).not.toHaveLength(0);

		const screenList = findByPredicate(
			tree,
			(node) => typeof node?.props?.data !== "undefined",
		)[0];
		expect(screenList.props.data).toHaveLength(0);
	});
});
