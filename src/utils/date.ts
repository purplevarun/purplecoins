import type { AnalysisPeriod } from "@/types/AnalysisPeriod";
import type { DateRange } from "@/types/DateRange";

const getAnalysisDateRange = (
	period: AnalysisPeriod,
	anchorDate: Date,
): DateRange => {
	const year = anchorDate.getFullYear();
	const month = anchorDate.getMonth();
	const start =
		period === "MONTH"
			? new Date(year, month, 1).getTime()
			: new Date(year, 0, 1).getTime();
	const end =
		period === "MONTH"
			? new Date(year, month + 1, 1).getTime() - 1
			: new Date(year + 1, 0, 1).getTime() - 1;
	return { start, end };
};

const shiftAnalysisAnchor = (
	period: AnalysisPeriod,
	anchorDate: Date,
	direction: -1 | 1,
): Date => {
	const shiftedDate = new Date(anchorDate);
	if (period === "MONTH") {
		shiftedDate.setMonth(shiftedDate.getMonth() + direction);
		return shiftedDate;
	}
	shiftedDate.setFullYear(shiftedDate.getFullYear() + direction);
	return shiftedDate;
};

const formatDate = (timestamp: number): string =>
	new Date(timestamp).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});

const formatDateTime = (timestamp: number): string =>
	new Date(timestamp).toLocaleString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

export {
	formatDate,
	formatDateTime,
	getAnalysisDateRange,
	shiftAnalysisAnchor,
};
