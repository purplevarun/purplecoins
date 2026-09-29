import type CategoryKind from "@/types/CategoryKind";

type Category = Readonly<{
	id: string;
	name: string;
	kind: CategoryKind;
	isIncome: boolean;
	createdAt: number;
	updatedAt: number;
	archived: boolean;
}>;

export type { Category as default };
