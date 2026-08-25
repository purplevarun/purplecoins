import type Category from "@/types/Category";
import type Investment from "@/types/Investment";
import type Source from "@/types/Source";
import type Trip from "@/types/Trip";

type RelationListItem =
	| { kind: "SOURCE"; entity: Source }
	| { kind: "CATEGORY"; entity: Category }
	| { kind: "TRIP"; entity: Trip }
	| { kind: "INVESTMENT"; entity: Investment };

export type { RelationListItem as default };
