import type AnalysisPeriod from "@/types/AnalysisPeriod";

type AnalysisDateRangeInput = Readonly<{
	period: AnalysisPeriod;
	anchorDate: Date;
	customStartAt: number;
	customEndAt: number;
	fyStartMonth: number;
}>;

export type { AnalysisDateRangeInput as default };
