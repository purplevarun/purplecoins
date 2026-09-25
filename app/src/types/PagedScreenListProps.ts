import type ScreenListProps from "@/types/ScreenListProps";

type PagedScreenListProps<T> = Readonly<
	Omit<ScreenListProps<T>, "ListFooterComponent">
>;

export type { PagedScreenListProps as default };
