import type { AnalysisPeriod } from "@/types/AnalysisPeriod";
import type { DateRange } from "@/types/DateRange";

const ALL_TIME_START = 0;
const ALL_TIME_END = 8_640_000_000_000_000;
const DAY_END_HOURS = 23;
const DAY_END_MINUTES = 59;
const DAY_END_SECONDS = 59;
const DAY_END_MILLISECONDS = 999;

const getYtdDateRange = (): DateRange => {
	const now = new Date();
	const start = new Date(
		now.getFullYear() - 1,
		now.getMonth(),
		now.getDate(),
		0,
		0,
		0,
		0,
	).getTime();
	const end = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		DAY_END_HOURS,
		DAY_END_MINUTES,
		DAY_END_SECONDS,
		DAY_END_MILLISECONDS,
	).getTime();
	return { start, end };
};

const getAnalysisDateRange = (
	period: AnalysisPeriod,
	anchorDate: Date,
): DateRange => {
	if (period === "ALL" || period === "CUSTOM") {
		return { start: ALL_TIME_START, end: ALL_TIME_END };
	}
	if (period === "YTD") {
		return getYtdDateRange();
	}
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
	if (period !== "YEAR") {
		return shiftedDate;
	}
	shiftedDate.setFullYear(shiftedDate.getFullYear() + direction);
	return shiftedDate;
};

const getCustomDateRange = (startAt: number, endAt: number): DateRange => {
	const startDate = new Date(Math.min(startAt, endAt));
	startDate.setHours(0, 0, 0, 0);
	const endDate = new Date(Math.max(startAt, endAt));
	endDate.setHours(
		DAY_END_HOURS,
		DAY_END_MINUTES,
		DAY_END_SECONDS,
		DAY_END_MILLISECONDS,
	);
	return { start: startDate.getTime(), end: endDate.getTime() };
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
	getCustomDateRange,
	getYtdDateRange,
	shiftAnalysisAnchor,
};
