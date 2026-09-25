import type EmptyStateProps from "@/types/EmptyStateProps";
import type ListItemProps from "@/types/ListItemProps";
import type Source from "@/types/Source";
import type { ReactElement } from "react";

type SourceListTestProps = Readonly<{
	data: readonly Source[];
	ListHeaderComponent: ReactElement;
	ListEmptyComponent: ReactElement<Pick<EmptyStateProps, "title">>;
	renderItem: (props: ListItemProps<Source>) => ReactElement;
}>;

export type { SourceListTestProps as default };
