import dateUtils from "@/utils/date";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
	formatDate,
	formatDateTime,
	getAnalysisDateRange,
	getCustomDateRange,
	getFyDateRange,
	getPreviousDateRange,
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

		it("spans from the same date last year to today (start/end of day)", () => {
			const range = getYtdDateRange();

			expect(range.start).toBe(
				new Date(2025, 6, 24, 0, 0, 0, 0).getTime(),
			);
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
				getYtdDateRange(),
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

		it("returns an unchanged clone for ALL/CUSTOM/YTD", () => {
			const anchor = new Date(2026, 5, 15);
			expect(shiftAnalysisAnchor("ALL", anchor, 1).getTime()).toBe(
				anchor.getTime(),
			);
			expect(shiftAnalysisAnchor("CUSTOM", anchor, -1).getTime()).toBe(
				anchor.getTime(),
			);
			expect(shiftAnalysisAnchor("YTD", anchor, 1).getTime()).toBe(
				anchor.getTime(),
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

		it("returns the previous YTD window shifted back 1 year", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date(2026, 6, 15));

			const range = getPreviousDateRange("YTD", new Date());

			vi.useRealTimers();

			// Current YTD: Jul 15 2025 → Jul 15 2026
			// Previous YTD: Jul 15 2024 → Jul 15 2025
			expect(range?.start).toBe(
				new Date(2024, 6, 15, 0, 0, 0, 0).getTime(),
			);
			expect(range?.end).toBe(
				new Date(2025, 6, 15, 23, 59, 59, 999).getTime(),
			);
		});
	});
});
