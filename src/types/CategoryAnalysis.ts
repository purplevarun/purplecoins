import type CategoryType from "@/types/CategoryType";

type CategoryAnalysis = Readonly<{
	categoryId: string;
	categoryName: string;
	type: CategoryType;
	currencyCode: string;
	credits: string;
	debits: string;
	net: string;
}>;

export type { CategoryAnalysis as default };
