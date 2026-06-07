import type { CategoryAnalysis } from "@/types/CategoryAnalysis";
import type { InvestmentAnalysis } from "@/types/InvestmentAnalysis";

type AnalysisSummary = Readonly<{
	categories: readonly CategoryAnalysis[];
	investments: readonly InvestmentAnalysis[];
	totalIncome: string;
	totalExpense: string;
	netProfit: string;
	missingCurrencies: readonly string[];
}>;

export type { AnalysisSummary };
