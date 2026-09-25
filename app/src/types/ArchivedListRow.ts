import type ArchivedEntity from "@/types/ArchivedEntity";
import type RelationKind from "@/types/RelationKind";

type ArchivedListRow =
	| { type: "header"; key: string; label: string }
	| {
			type: "entity";
			key: string;
			kind: RelationKind;
			entity: ArchivedEntity;
	  };

export type { ArchivedListRow as default };
