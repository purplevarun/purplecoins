import type { RelationKind } from "@/types/RelationKind";

type LinkedTransactionFilter = Readonly<{
	kind: RelationKind;
	entityId: string;
}>;

export type { LinkedTransactionFilter };
