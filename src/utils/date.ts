import type AnalysisPeriod from "@/types/AnalysisPeriod";
import type DateRange from "@/types/DateRange";
import type MonthWindow from "@/types/MonthWindow";

const ALL_TIME_START = 0;
const ALL_TIME_END = 8_640_000_000_000_000;
const DAY_END_HOURS = 23;
const DAY_END_MINUTES = 59;
const DAY_END_SECONDS = 59;
const DAY_END_MILLISECONDS = 999;

const getFyDateRange = (anchorDate: Date, fyStartMonth: number): DateRange => {
	// fyStartMonth is 1-based (4 = April)
	const month0 = anchorDate.getMonth() + 1; // 1-based
	const year = anchorDate.getFullYear();
	// Determine which FY we're in
	const fyStartYear = month0 >= fyStartMonth ? year : year - 1;
	const fyEndMonth0 = fyStartMonth - 1; // 0-based month for end
	const fyEndYear = fyStartYear + 1;
	const start = new Date(fyStartYear, fyStartMonth - 1, 1).getTime();
	const end = new Date(fyEndYear, fyEndMonth0, 1).getTime() - 1;
	return { start, end };
};

const getYtdDateRange = (anchorDate: Date): DateRange => {
	const year = anchorDate.getFullYear();
	const month = anchorDate.getMonth();
	const day = anchorDate.getDate();
	// Rolling 12-month window: from this date last year to this date this year.
	const start = new Date(year - 1, month, day, 0, 0, 0, 0).getTime();
	const now = new Date();
	const isCurrentYear = year === now.getFullYear();
	// Cap end at today for the current year so future dates are excluded.
	const endDate = isCurrentYear
		? new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
				DAY_END_HOURS,
				DAY_END_MINUTES,
				DAY_END_SECONDS,
				DAY_END_MILLISECONDS,
			)
		: new Date(
				year,
				month,
				day,
				DAY_END_HOURS,
				DAY_END_MINUTES,
				DAY_END_SECONDS,
				DAY_END_MILLISECONDS,
			);
	return { start, end: endDate.getTime() };
};

const getAnalysisDateRange = (
	period: AnalysisPeriod,
	anchorDate: Date,
	fyStartMonth = 4,
): DateRange => {
	if (period === "ALL" || period === "CUSTOM") {
		return { start: ALL_TIME_START, end: ALL_TIME_END };
	}
	if (period === "FY") {
		return getFyDateRange(anchorDate, fyStartMonth);
	}
	if (period === "YTD") {
		return getYtdDateRange(anchorDate);
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
	minDate?: number,
	maxDate?: number,
): Date => {
	const shiftedDate = new Date(anchorDate);
	if (period === "MONTH") {
		shiftedDate.setMonth(shiftedDate.getMonth() + direction);
	} else if (period === "YEAR" || period === "YTD") {
		shiftedDate.setFullYear(shiftedDate.getFullYear() + direction);
	} else if (period === "FY") {
		shiftedDate.setFullYear(shiftedDate.getFullYear() + direction);
	} else {
		return shiftedDate;
	}

	// Clamp: don't go before min or after max
	if (direction === -1 && minDate !== undefined) {
		const minAnchor = new Date(minDate);
		if (
			period === "MONTH" &&
			(shiftedDate.getFullYear() < minAnchor.getFullYear() ||
				(shiftedDate.getFullYear() === minAnchor.getFullYear() &&
					shiftedDate.getMonth() < minAnchor.getMonth()))
		) {
			return anchorDate;
		}
		if (
			(period === "YEAR" || period === "YTD" || period === "FY") &&
			shiftedDate.getFullYear() < minAnchor.getFullYear()
		) {
			return anchorDate;
		}
	}
	if (direction === 1 && maxDate !== undefined) {
		const maxAnchor = new Date(maxDate);
		if (
			period === "MONTH" &&
			(shiftedDate.getFullYear() > maxAnchor.getFullYear() ||
				(shiftedDate.getFullYear() === maxAnchor.getFullYear() &&
					shiftedDate.getMonth() > maxAnchor.getMonth()))
		) {
			return anchorDate;
		}
		if (
			(period === "YEAR" || period === "YTD" || period === "FY") &&
			shiftedDate.getFullYear() > maxAnchor.getFullYear()
		) {
			return anchorDate;
		}
	}

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

// Returns the equivalent period immediately before the given period/anchor.
// Used to compute period-over-period % change. Returns null for ALL/CUSTOM.
const getPreviousDateRange = (
	period: AnalysisPeriod,
	anchorDate: Date,
	fyStartMonth = 4,
): DateRange | null => {
	if (period === "ALL" || period === "CUSTOM") {
		return null;
	}
	if (period === "YTD") {
		const previousAnchor = new Date(anchorDate);
		previousAnchor.setFullYear(previousAnchor.getFullYear() - 1);
		return getAnalysisDateRange("YTD", previousAnchor, fyStartMonth);
	}
	const prevAnchor = new Date(anchorDate);
	if (period === "MONTH") {
		prevAnchor.setMonth(prevAnchor.getMonth() - 1);
	} else {
		prevAnchor.setFullYear(prevAnchor.getFullYear() - 1);
	}
	return getAnalysisDateRange(period, prevAnchor, fyStartMonth);
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

// Trailing calendar-month windows ending on anchorDate's month (oldest first).
// Used to bucket trend charts independently of the selected analysis period.
const getTrailingMonthWindows = (
	monthsCount: number,
	anchorDate: Date,
): readonly MonthWindow[] =>
	Array.from({ length: monthsCount }, (_, index) => {
		const offset = monthsCount - 1 - index;
		const monthDate = new Date(
			anchorDate.getFullYear(),
			anchorDate.getMonth() - offset,
			1,
		);
		const start = monthDate.getTime();
		const end =
			new Date(
				monthDate.getFullYear(),
				monthDate.getMonth() + 1,
				1,
			).getTime() - 1;
		const label = monthDate.toLocaleString("en-IN", { month: "short" });
		return { start, end, label };
	});

// One window per calendar day within the given range, oldest first.
const getDayWindows = (dateRange: DateRange): readonly MonthWindow[] => {
	const windows: MonthWindow[] = [];
	const cursor = new Date(dateRange.start);
	cursor.setHours(0, 0, 0, 0);
	while (cursor.getTime() <= dateRange.end) {
		const start = cursor.getTime();
		const end = new Date(
			cursor.getFullYear(),
			cursor.getMonth(),
			cursor.getDate(),
			DAY_END_HOURS,
			DAY_END_MINUTES,
			DAY_END_SECONDS,
			DAY_END_MILLISECONDS,
		).getTime();
		const label = cursor.toLocaleString("en-IN", {
			day: "numeric",
			month: "short",
		});
		windows.push({ start, end, label });
		cursor.setDate(cursor.getDate() + 1);
	}
	return windows;
};

// One window per calendar month overlapping the given range, oldest first.
const getMonthWindowsInRange = (
	dateRange: DateRange,
): readonly MonthWindow[] => {
	const windows: MonthWindow[] = [];
	const cursor = new Date(dateRange.start);
	cursor.setDate(1);
	cursor.setHours(0, 0, 0, 0);
	while (cursor.getTime() <= dateRange.end) {
		const start = cursor.getTime();
		const end =
			new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1).getTime() -
			1;
		const label = cursor.toLocaleString("en-IN", {
			month: "short",
			year: "2-digit",
		});
		windows.push({ start, end, label });
		cursor.setMonth(cursor.getMonth() + 1);
	}
	return windows;
};

// One window per calendar year spanning minDate..maxDate, oldest first.
const getYearWindowsInRange = (
	minDate: number,
	maxDate: number,
): readonly MonthWindow[] => {
	const windows: MonthWindow[] = [];
	const startYear = new Date(minDate).getFullYear();
	const endYear = new Date(maxDate).getFullYear();
	for (let year = startYear; year <= endYear; year++) {
		const start = new Date(year, 0, 1).getTime();
		const end = new Date(year + 1, 0, 1).getTime() - 1;
		windows.push({ start, end, label: String(year) });
	}
	return windows;
};

// Same date range as the given period but shifted back exactly one year.
// Returns null for ALL/CUSTOM (year-over-year comparison is not meaningful).
const getYearOverYearDateRange = (
	period: AnalysisPeriod,
	anchorDate: Date,
	fyStartMonth = 4,
): DateRange | null => {
	if (period === "ALL" || period === "CUSTOM") {
		return null;
	}
	const prevAnchor = new Date(anchorDate);
	prevAnchor.setFullYear(prevAnchor.getFullYear() - 1);
	return getAnalysisDateRange(period, prevAnchor, fyStartMonth);
};

const dateUtils = {
	formatDate,
	formatDateTime,
	getAnalysisDateRange,
	getCustomDateRange,
	getDayWindows,
	getFyDateRange,
	getMonthWindowsInRange,
	getPreviousDateRange,
	getTrailingMonthWindows,
	getYearOverYearDateRange,
	getYearWindowsInRange,
	getYtdDateRange,
	shiftAnalysisAnchor,
};

export default dateUtils;
