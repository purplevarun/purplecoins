import type Investment from "@/types/Investment";

type InvestmentListItem<Entity = Investment> =
	| Readonly<{ kind: "INVESTMENT"; entity: Entity }>
	| Readonly<{ kind: "GROUP_HEADER"; title: string }>;

export type { InvestmentListItem as default };
