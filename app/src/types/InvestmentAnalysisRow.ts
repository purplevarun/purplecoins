type InvestmentAnalysisRow = Readonly<{
	investmentId: string;
	investmentName: string;
	currencyCode: string;
	totalInvested: number;
	totalRedeemed: number;
}>;

export type { InvestmentAnalysisRow as default };
