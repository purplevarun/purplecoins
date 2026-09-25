type CategoryAnalysisRow = Readonly<{
	categoryId: string;
	categoryName: string;
	isIncome: number;
	currencyCode: string;
	credits: number;
	debits: number;
}>;

export type { CategoryAnalysisRow as default };
