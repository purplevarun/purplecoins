type CategoryAnalysis = Readonly<{
	categoryId: string;
	categoryName: string;
	isIncome: boolean;
	currencyCode: string;
	credits: string;
	debits: string;
	net: string;
}>;

export type { CategoryAnalysis };
