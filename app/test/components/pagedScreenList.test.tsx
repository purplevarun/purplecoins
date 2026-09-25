import AppButton from "@/components/AppButton";
import ScreenList from "@/components/ScreenList";
import type AppButtonProps from "@/types/AppButtonProps";
import type ScreenListProps from "@/types/ScreenListProps";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const reactMocks = vi.hoisted(() => ({
	useCallback: vi.fn((fn: unknown) => fn),
	useMemo: vi.fn((factory: () => unknown) => factory()),
	useState: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react")>();
	return {
		...actual,
		useCallback: reactMocks.useCallback,
		useMemo: reactMocks.useMemo,
		useState: reactMocks.useState,
	};
});

vi.mock("react-native", () => ({
	StyleSheet: { create: (styles: unknown) => styles },
}));

vi.mock("@/components/AppButton", () => ({
	default: (props: unknown) => ({ type: "AppButton", props }),
}));
vi.mock("@/components/ScreenList", () => ({
	default: (props: unknown) => ({ type: "ScreenList", props }),
}));

import PagedScreenList from "@/components/PagedScreenList";

type Item = Readonly<{ id: string }>;

const renderItem = (): null => null;

const renderList = (
	props: Partial<ScreenListProps<Item>>,
): ReactElement<ScreenListProps<Item>> =>
	(
		PagedScreenList as (
			props: unknown,
		) => ReactElement<ScreenListProps<Item>>
	)({ renderItem, ...props });

const footerButton = (
	list: ReactElement<ScreenListProps<Item>>,
): ReactElement<AppButtonProps> =>
	list.props.ListFooterComponent as ReactElement<AppButtonProps>;

describe("PagedScreenList", () => {
	beforeEach(() => {
		reactMocks.useState.mockReset();
		reactMocks.useState.mockImplementation((initial: unknown) => [
			initial,
			vi.fn(),
		]);
	});

	it("renders ten or fewer items without a Load more button", () => {
		const data: readonly Item[] = Array.from(
			{ length: 10 },
			(_, index) => ({
				id: String(index),
			}),
		);
		const keyExtractor = (item: Item): string => item.id;
		const list = renderList({ data, keyExtractor });
		expect(list.type).toBe(ScreenList);
		expect(list.props.data).toEqual(data);
		expect(list.props.renderItem).toBe(renderItem);
		expect(list.props.keyExtractor).toBe(keyExtractor);
		expect(list.props.ListFooterComponent).toBeNull();
	});

	it("renders missing data as an empty list without a Load more button", () => {
		const list = renderList({ data: undefined });
		expect(list.props.data).toEqual([]);
		expect(list.props.ListFooterComponent).toBeNull();
	});

	it("shows only the first page and loads ten more items per press", () => {
		const setVisibleCount = vi.fn();
		reactMocks.useState.mockReturnValueOnce([10, setVisibleCount]);
		const data: readonly Item[] = Array.from(
			{ length: 25 },
			(_, index) => ({
				id: String(index),
			}),
		);
		const list = renderList({ data });
		expect(list.props.data).toEqual(data.slice(0, 10));
		const button = footerButton(list);
		expect(button).not.toBeNull();
		expect(button.props.label).toBe("Load more");
		button.props.onPress();
		const update = setVisibleCount.mock.calls[0]?.[0] as (
			current: number,
		) => number;
		expect(update(10)).toBe(20);
		expect(update(20)).toBe(30);
	});

	it("hides Load more once every item is visible", () => {
		reactMocks.useState.mockReturnValueOnce([20, vi.fn()]);
		const data: readonly Item[] = Array.from(
			{ length: 15 },
			(_, index) => ({
				id: String(index),
			}),
		);
		const list = renderList({ data });
		expect(list.props.data).toEqual(data);
		expect(list.props.ListFooterComponent).toBeNull();
	});

	it("uses the AppButton footer for paging", () => {
		reactMocks.useState.mockReturnValueOnce([10, vi.fn()]);
		const data: readonly Item[] = Array.from(
			{ length: 11 },
			(_, index) => ({
				id: String(index),
			}),
		);
		const list = renderList({ data });
		expect(footerButton(list).type).toBe(AppButton);
		expect(footerButton(list).props.icon).toBe("chevron-down-outline");
		expect(footerButton(list).props.variant).toBe("secondary");
	});
});
