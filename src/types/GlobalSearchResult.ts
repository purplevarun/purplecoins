import type { GlobalSearchResultKind } from "@/types/GlobalSearchResultKind";
import type { IconName } from "@/types/IconName";

type GlobalSearchResult = Readonly<{
	id: string;
	kind: GlobalSearchResultKind;
	title: string;
	subtitle: string;
	icon: IconName;
	color: string;
	searchExtra?: string;
}>;

export type { GlobalSearchResult };
