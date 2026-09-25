import { type FlashListProps } from "@shopify/flash-list";

type ScreenListProps<T> = Readonly<
	Omit<FlashListProps<T>, "contentContainerStyle">
>;

export type { ScreenListProps as default };
