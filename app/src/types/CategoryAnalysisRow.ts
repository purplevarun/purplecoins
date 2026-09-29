type CategoryAnalysisRow = Readonly<{
	categoryId: string;
	categoryName: string;
	kind: string;
	currencyCode: string;
	credits: number;
	debits: number;
}>;

export type { CategoryAnalysisRow as default };
