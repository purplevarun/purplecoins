import type CategoryKind from "@/types/CategoryKind";

type CategoryAnalysis = Readonly<{
	categoryId: string;
	categoryName: string;
	kind: CategoryKind;
	isIncome: boolean;
	currencyCode: string;
	credits: string;
	debits: string;
	net: string;
}>;

export type { CategoryAnalysis as default };
