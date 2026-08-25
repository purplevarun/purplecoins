import type DateRange from "@/types/DateRange";

type AnalysisOptions = Readonly<{
	dateRange: DateRange;
	isNativeCurrency: boolean;
}>;

export type { AnalysisOptions as default };
