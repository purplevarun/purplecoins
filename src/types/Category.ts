import type CategoryType from "@/types/CategoryType";

type Category = Readonly<{
	id: string;
	name: string;
	type: CategoryType;
	createdAt: number;
	updatedAt: number;
	archived: boolean;
}>;

export type { Category as default };
