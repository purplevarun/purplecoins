type InvestmentAnalysis = Readonly<{
	investmentId: string;
	investmentName: string;
	currencyCode: string;
	totalInvested: string;
	totalRedeemed: string;
	net: string;
}>;

export type { InvestmentAnalysis };
