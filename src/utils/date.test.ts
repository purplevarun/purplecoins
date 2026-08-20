import dateUtils from "@/utils/date";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
	formatDate,
	formatDateTime,
	getAnalysisDateRange,
	getCustomDateRange,
	getDayWindows,
	getFyDateRange,
	getMonthWindowsInRange,
	getPreviousDateRange,
	getYearOverYearDateRange,
	getYearWindowsInRange,
	getYtdDateRange,
	shiftAnalysisAnchor,
} = dateUtils;

const ALL_TIME_START = 0;
const ALL_TIME_END = 8_640_000_000_000_000;

describe("date utilities", () => {
	describe("getFyDateRange", () => {
		it("uses the current year as the FY start when the anchor is on/after the FY start month", () => {
			const anchor = new Date(2026, 6, 24); // July 2026, FY starts April
			const range = getFyDateRange(anchor, 4);

			expect(range.start).toBe(new Date(2026, 3, 1).getTime());
			expect(range.end).toBe(new Date(2027, 3, 1).getTime() - 1);
		});

		it("uses the previous year as the FY start when the anchor is before the FY start month", () => {
			const anchor = new Date(2026, 1, 10); // February 2026
			const range = getFyDateRange(anchor, 4);

			expect(range.start).toBe(new Date(2025, 3, 1).getTime());
			expect(range.end).toBe(new Date(2026, 3, 1).getTime() - 1);
		});

		it("treats an anchor exactly on the FY start month as the current FY", () => {
			const anchor = new Date(2026, 3, 1); // April 1st
			const range = getFyDateRange(anchor, 4);

			expect(range.start).toBe(new Date(2026, 3, 1).getTime());
		});

		it("supports a January FY start month", () => {
			const anchor = new Date(2026, 5, 1);
			const range = getFyDateRange(anchor, 1);

			expect(range.start).toBe(new Date(2026, 0, 1).getTime());
			expect(range.end).toBe(new Date(2027, 0, 1).getTime() - 1);
		});
	});

	describe("getYtdDateRange", () => {
		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date(2026, 6, 24, 12, 0, 0));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("spans rolling 12 months: same month/day last year to same month/day this year", () => {
			const range = getYtdDateRange(new Date(2026, 6, 24));

			// start = Jul 24, 2025 (one year before anchor)
			expect(range.start).toBe(
				new Date(2025, 6, 24, 0, 0, 0, 0).getTime(),
			);
			// end = Jul 24, 2026 end-of-day (capped at today since anchor is current year)
			expect(range.end).toBe(
				new Date(2026, 6, 24, 23, 59, 59, 999).getTime(),
			);
		});
	});

	describe("getAnalysisDateRange", () => {
		it("returns the full representable range for ALL", () => {
			const range = getAnalysisDateRange("ALL", new Date(2026, 6, 24));
			expect(range).toEqual({ start: ALL_TIME_START, end: ALL_TIME_END });
		});

		it("returns the full representable range for CUSTOM (caller applies its own range)", () => {
			const range = getAnalysisDateRange("CUSTOM", new Date(2026, 6, 24));
			expect(range).toEqual({ start: ALL_TIME_START, end: ALL_TIME_END });
		});

		it("delegates to getFyDateRange for FY", () => {
			const anchor = new Date(2026, 6, 24);
			expect(getAnalysisDateRange("FY", anchor, 4)).toEqual(
				getFyDateRange(anchor, 4),
			);
		});

		it("delegates to getYtdDateRange for YTD", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date(2026, 6, 24, 12, 0, 0));

			expect(getAnalysisDateRange("YTD", new Date(2026, 6, 24))).toEqual(
				getYtdDateRange(new Date(2026, 6, 24)),
			);

			vi.useRealTimers();
		});

		it("spans the whole calendar month for MONTH", () => {
			const range = getAnalysisDateRange("MONTH", new Date(2026, 1, 15));

			expect(range.start).toBe(new Date(2026, 1, 1).getTime());
			expect(range.end).toBe(new Date(2026, 2, 1).getTime() - 1);
		});

		it("spans the whole calendar year for YEAR", () => {
			const range = getAnalysisDateRange("YEAR", new Date(2026, 5, 1));

			expect(range.start).toBe(new Date(2026, 0, 1).getTime());
			expect(range.end).toBe(new Date(2027, 0, 1).getTime() - 1);
		});

		it("defaults the FY start month to April when not provided", () => {
			const anchor = new Date(2026, 6, 24);
			expect(getAnalysisDateRange("FY", anchor)).toEqual(
				getFyDateRange(anchor, 4),
			);
		});
	});

	describe("shiftAnalysisAnchor", () => {
		it("shifts MONTH forward and backward by one month", () => {
			const anchor = new Date(2026, 5, 15); // June 2026
			expect(shiftAnalysisAnchor("MONTH", anchor, 1).getMonth()).toBe(6);
			expect(shiftAnalysisAnchor("MONTH", anchor, -1).getMonth()).toBe(4);
		});

		it("shifts YEAR forward and backward by one year", () => {
			const anchor = new Date(2026, 5, 15);
			expect(shiftAnalysisAnchor("YEAR", anchor, 1).getFullYear()).toBe(
				2027,
			);
			expect(shiftAnalysisAnchor("YEAR", anchor, -1).getFullYear()).toBe(
				2025,
			);
		});

		it("shifts FY by one year, same as YEAR", () => {
			const anchor = new Date(2026, 5, 15);
			expect(shiftAnalysisAnchor("FY", anchor, 1).getFullYear()).toBe(
				2027,
			);
		});

		it("returns an unchanged clone for ALL/CUSTOM", () => {
			const anchor = new Date(2026, 5, 15);
			expect(shiftAnalysisAnchor("ALL", anchor, 1).getTime()).toBe(
				anchor.getTime(),
			);
			expect(shiftAnalysisAnchor("CUSTOM", anchor, -1).getTime()).toBe(
				anchor.getTime(),
			);
		});

		it("shifts YTD by one year", () => {
			const anchor = new Date(2026, 5, 15);
			expect(shiftAnalysisAnchor("YTD", anchor, 1).getFullYear()).toBe(
				2027,
			);
			expect(shiftAnalysisAnchor("YTD", anchor, -1).getFullYear()).toBe(
				2025,
			);
		});

		it("clamps MONTH from moving before minDate", () => {
			const anchor = new Date(2026, 0, 15); // Jan 2026
			const minDate = new Date(2026, 0, 1).getTime();

			const result = shiftAnalysisAnchor("MONTH", anchor, -1, minDate);

			expect(result.getTime()).toBe(anchor.getTime());
		});

		it("allows MONTH to move backward when still within minDate's month", () => {
			const anchor = new Date(2026, 1, 15); // Feb 2026
			const minDate = new Date(2026, 0, 1).getTime();

			const result = shiftAnalysisAnchor("MONTH", anchor, -1, minDate);

			expect(result.getMonth()).toBe(0);
		});

		it("clamps MONTH from moving after maxDate", () => {
			const anchor = new Date(2026, 11, 15); // Dec 2026
			const maxDate = new Date(2026, 11, 31).getTime();

			const result = shiftAnalysisAnchor(
				"MONTH",
				anchor,
				1,
				undefined,
				maxDate,
			);

			expect(result.getTime()).toBe(anchor.getTime());
		});

		it("allows MONTH to move forward when still within maxDate's month", () => {
			const anchor = new Date(2026, 0, 15); // Jan 2026
			const maxDate = new Date(2026, 1, 28).getTime(); // Feb 2026

			const result = shiftAnalysisAnchor(
				"MONTH",
				anchor,
				1,
				undefined,
				maxDate,
			);

			expect(result.getMonth()).toBe(1);
		});

		it("clamps MONTH when the shifted month is later within maxDate's own year", () => {
			const anchor = new Date(2026, 0, 15); // Jan 2026
			const maxDate = new Date(2026, 0, 31).getTime(); // still Jan 2026

			const result = shiftAnalysisAnchor(
				"MONTH",
				anchor,
				1,
				undefined,
				maxDate,
			);

			expect(result.getTime()).toBe(anchor.getTime());
		});

		it("clamps YEAR from moving before minDate's year", () => {
			const anchor = new Date(2026, 5, 1);
			const minDate = new Date(2026, 0, 1).getTime();

			const result = shiftAnalysisAnchor("YEAR", anchor, -1, minDate);

			expect(result.getTime()).toBe(anchor.getTime());
		});

		it("clamps YEAR from moving after maxDate's year", () => {
			const anchor = new Date(2026, 5, 1);
			const maxDate = new Date(2026, 11, 31).getTime();

			const result = shiftAnalysisAnchor(
				"YEAR",
				anchor,
				1,
				undefined,
				maxDate,
			);

			expect(result.getTime()).toBe(anchor.getTime());
		});
	});

	describe("getCustomDateRange", () => {
		it("sets the start of day and end of day for a normal (start <= end) range", () => {
			const start = new Date(2026, 0, 1, 10, 30).getTime();
			const end = new Date(2026, 0, 31, 8, 0).getTime();

			const range = getCustomDateRange(start, end);

			expect(range.start).toBe(
				new Date(2026, 0, 1, 0, 0, 0, 0).getTime(),
			);
			expect(range.end).toBe(
				new Date(2026, 0, 31, 23, 59, 59, 999).getTime(),
			);
		});

		it("normalizes a swapped (end before start) range", () => {
			const start = new Date(2026, 0, 31).getTime();
			const end = new Date(2026, 0, 1).getTime();

			const range = getCustomDateRange(start, end);

			expect(range.start).toBe(
				new Date(2026, 0, 1, 0, 0, 0, 0).getTime(),
			);
			expect(range.end).toBe(
				new Date(2026, 0, 31, 23, 59, 59, 999).getTime(),
			);
		});
	});

	describe("formatDate / formatDateTime", () => {
		it("formats a date as 'DD Mon YYYY'", () => {
			const timestamp = new Date(2026, 6, 24, 15, 30).getTime();
			expect(formatDate(timestamp)).toBe("24 Jul 2026");
		});

		it("formats a date-time including hour and minute", () => {
			const timestamp = new Date(2026, 6, 24, 15, 30).getTime();
			expect(formatDateTime(timestamp)).toContain("24 Jul 2026");
			expect(formatDateTime(timestamp)).toMatch(/03:30\s*pm/i);
		});
	});

	describe("getPreviousDateRange", () => {
		it("returns null for ALL period", () => {
			expect(
				getPreviousDateRange("ALL", new Date(2026, 6, 1)),
			).toBeNull();
		});

		it("returns null for CUSTOM period", () => {
			expect(
				getPreviousDateRange("CUSTOM", new Date(2026, 6, 1)),
			).toBeNull();
		});

		it("returns the previous month's range for MONTH period", () => {
			const range = getPreviousDateRange("MONTH", new Date(2026, 6, 15));

			expect(range?.start).toBe(new Date(2026, 5, 1).getTime());
			expect(range?.end).toBe(new Date(2026, 6, 1).getTime() - 1);
		});

		it("wraps back to December when the anchor is January for MONTH period", () => {
			const range = getPreviousDateRange("MONTH", new Date(2026, 0, 15));

			expect(range?.start).toBe(new Date(2025, 11, 1).getTime());
			expect(range?.end).toBe(new Date(2026, 0, 1).getTime() - 1);
		});

		it("returns the previous year's range for YEAR period", () => {
			const range = getPreviousDateRange("YEAR", new Date(2026, 6, 15));

			expect(range?.start).toBe(new Date(2025, 0, 1).getTime());
			expect(range?.end).toBe(new Date(2026, 0, 1).getTime() - 1);
		});

		it("returns the previous FY range for FY period", () => {
			// Anchor July 2026, FY starts April → current FY is Apr 2026–Mar 2027
			// Previous FY is Apr 2025–Mar 2026
			const range = getPreviousDateRange("FY", new Date(2026, 6, 15), 4);

			expect(range?.start).toBe(new Date(2025, 3, 1).getTime());
			expect(range?.end).toBe(new Date(2026, 3, 1).getTime() - 1);
		});

		it("returns the previous YTD year range", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date(2026, 6, 15));

			const range = getPreviousDateRange("YTD", new Date());

			vi.useRealTimers();

			// Current YTD 2026: Jul 15, 2025 -> Jul 15, 2026.
			// Previous YTD 2025: Jul 15, 2024 -> Jul 15, 2025 (end-of-day, not current year).
			expect(range?.start).toBe(
				new Date(2024, 6, 15, 0, 0, 0, 0).getTime(),
			);
			expect(range?.end).toBe(
				new Date(2025, 6, 15, 23, 59, 59, 999).getTime(),
			);
		});
	});

	describe("getDayWindows", () => {
		it("produces one window per day in the range", () => {
			const start = new Date(2026, 0, 1).getTime();
			const end = new Date(2026, 0, 3, 23, 59, 59, 999).getTime();
			const windows = getDayWindows({ start, end });

			expect(windows).toHaveLength(3);
			expect(windows[0]?.start).toBe(
				new Date(2026, 0, 1, 0, 0, 0, 0).getTime(),
			);
			expect(windows[0]?.end).toBe(
				new Date(2026, 0, 1, 23, 59, 59, 999).getTime(),
			);
			expect(windows[2]?.start).toBe(
				new Date(2026, 0, 3, 0, 0, 0, 0).getTime(),
			);
		});

		it("produces a single window for a same-day range", () => {
			const ts = new Date(2026, 5, 15, 10, 30).getTime();
			const windows = getDayWindows({ start: ts, end: ts });

			expect(windows).toHaveLength(1);
			expect(windows[0]?.label).toBe("15 Jun");
		});
	});

	describe("getMonthWindowsInRange", () => {
		it("produces one window per calendar month in the range", () => {
			const start = new Date(2026, 0, 15).getTime();
			const end = new Date(2026, 2, 10).getTime();
			const windows = getMonthWindowsInRange({ start, end });

			expect(windows).toHaveLength(3); // Jan, Feb, Mar
			expect(windows[0]?.start).toBe(new Date(2026, 0, 1).getTime());
			expect(windows[0]?.end).toBe(new Date(2026, 1, 1).getTime() - 1);
			expect(windows[2]?.start).toBe(new Date(2026, 2, 1).getTime());
		});

		it("produces a single window for a same-month range", () => {
			const start = new Date(2026, 3, 5).getTime();
			const end = new Date(2026, 3, 20).getTime();
			const windows = getMonthWindowsInRange({ start, end });

			expect(windows).toHaveLength(1);
		});

		it("includes partial months at both ends", () => {
			const start = new Date(2026, 11, 25).getTime(); // Dec 25
			const end = new Date(2027, 1, 5).getTime(); // Feb 5
			const windows = getMonthWindowsInRange({ start, end });

			expect(windows).toHaveLength(3); // Dec, Jan, Feb
		});
	});

	describe("getYearWindowsInRange", () => {
		it("produces one window per year between minDate and maxDate", () => {
			const min = new Date(2024, 3, 1).getTime();
			const max = new Date(2026, 8, 30).getTime();
			const windows = getYearWindowsInRange(min, max);

			expect(windows).toHaveLength(3); // 2024, 2025, 2026
			expect(windows[0]?.label).toBe("2024");
			expect(windows[0]?.start).toBe(new Date(2024, 0, 1).getTime());
			expect(windows[0]?.end).toBe(new Date(2025, 0, 1).getTime() - 1);
			expect(windows[2]?.label).toBe("2026");
		});

		it("produces a single window when minDate and maxDate are in the same year", () => {
			const min = new Date(2026, 2, 1).getTime();
			const max = new Date(2026, 9, 31).getTime();
			const windows = getYearWindowsInRange(min, max);

			expect(windows).toHaveLength(1);
			expect(windows[0]?.label).toBe("2026");
		});
	});

	describe("getYearOverYearDateRange", () => {
		it("returns null for ALL period", () => {
			expect(
				getYearOverYearDateRange("ALL", new Date(2026, 6, 1)),
			).toBeNull();
		});

		it("returns null for CUSTOM period", () => {
			expect(
				getYearOverYearDateRange("CUSTOM", new Date(2026, 6, 1)),
			).toBeNull();
		});

		it("returns the same calendar month one year earlier for MONTH", () => {
			const range = getYearOverYearDateRange(
				"MONTH",
				new Date(2026, 6, 15),
			);

			expect(range?.start).toBe(new Date(2025, 6, 1).getTime());
			expect(range?.end).toBe(new Date(2025, 7, 1).getTime() - 1);
		});

		it("returns the same calendar year one year earlier for YEAR", () => {
			const range = getYearOverYearDateRange(
				"YEAR",
				new Date(2026, 5, 1),
			);

			expect(range?.start).toBe(new Date(2025, 0, 1).getTime());
			expect(range?.end).toBe(new Date(2026, 0, 1).getTime() - 1);
		});

		it("returns the same FY one year earlier for FY", () => {
			// Anchor Jul 2026, FY start April → FY 2026–27
			// YoY → anchor Jul 2025, same FY start → FY 2025–26
			const range = getYearOverYearDateRange(
				"FY",
				new Date(2026, 6, 15),
				4,
			);

			expect(range?.start).toBe(new Date(2025, 3, 1).getTime());
			expect(range?.end).toBe(new Date(2026, 3, 1).getTime() - 1);
		});

		it("uses YTD date range one year earlier for YTD", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date(2026, 6, 15));

			const range = getYearOverYearDateRange(
				"YTD",
				new Date(2026, 6, 15),
			);

			vi.useRealTimers();

			// YoY for YTD 2026 → YTD 2025 (anchor = Jul 15, 2025)
			expect(range?.start).toBe(
				new Date(2024, 6, 15, 0, 0, 0, 0).getTime(),
			);
		});
	});
});
