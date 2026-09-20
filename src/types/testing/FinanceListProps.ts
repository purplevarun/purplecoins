import type AppButtonProps from "@/types/AppButtonProps";
import type ListItemProps from "@/types/ListItemProps";
import type { ReactElement } from "react";

type FinanceListProps<Item> = Readonly<{
	data: readonly Item[];
	keyExtractor: (item: Item) => string;
	renderItem: (
		props: ListItemProps<Item>,
	) => ReactElement<Pick<AppButtonProps, "onPress">>;
}>;

export type { FinanceListProps as default };
