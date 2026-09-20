import type CategoryAnalysis from "@/types/CategoryAnalysis";
import type InvestmentAnalysis from "@/types/InvestmentAnalysis";

type AnalysisDetailsView = Readonly<{
	type: "error" | "empty" | "list";
	items: readonly (CategoryAnalysis | InvestmentAnalysis)[];
	emptyMessage: string;
	emptyTitle: string;
	errorMessage: string;
}>;

export type { AnalysisDetailsView as default };
