import dateUtils from "@/utils/date";

import { describe, expect, it, vi } from "vitest";

const {
	formatDate,
	formatDateTime,
	getAnalysisDateRange,
	getCustomDateRange,
	getFyDateRange,
	getYtdDateRange,
	shiftAnalysisAnchor,
} = dateUtils;

describe("date utils", () => {
	it("returns all-time range for ALL and CUSTOM", () => {
		const anchor = new Date("2026-08-25T10:00:00.000Z");
		expect(getAnalysisDateRange("ALL", anchor)).toEqual({
			start: 0,
			end: 8_640_000_000_000_000,
		});
		expect(getAnalysisDateRange("CUSTOM", anchor)).toEqual({
			start: 0,
			end: 8_640_000_000_000_000,
		});
	});

	it("returns FY range using start month", () => {
		const anchor = new Date("2026-05-12T00:00:00.000Z");
		const range = getFyDateRange(anchor, 4);
		expect(range.start).toBe(new Date(2026, 3, 1).getTime());
		expect(range.end).toBe(new Date(2027, 3, 1).getTime() - 1);
	});

	it("returns month and year ranges", () => {
		const anchor = new Date("2026-08-25T00:00:00.000Z");
		expect(getAnalysisDateRange("MONTH", anchor)).toEqual({
			start: new Date(2026, 7, 1).getTime(),
			end: new Date(2026, 8, 1).getTime() - 1,
		});
		expect(getAnalysisDateRange("YEAR", anchor)).toEqual({
			start: new Date(2026, 0, 1).getTime(),
			end: new Date(2027, 0, 1).getTime() - 1,
		});
	});

	it("routes FY and YTD through getAnalysisDateRange", () => {
		const anchor = new Date("2026-05-12T00:00:00.000Z");
		expect(getAnalysisDateRange("FY", anchor, 4)).toEqual({
			start: new Date(2026, 3, 1).getTime(),
			end: new Date(2027, 3, 1).getTime() - 1,
		});

		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T10:20:30.000Z"));
		expect(getAnalysisDateRange("YTD", anchor)).toEqual({
			start: new Date(2025, 7, 25, 0, 0, 0, 0).getTime(),
			end: new Date(2026, 7, 25, 23, 59, 59, 999).getTime(),
		});
		vi.useRealTimers();
	});

	it("returns deterministic ytd range around mocked now", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T10:20:30.000Z"));

		const range = getYtdDateRange();
		expect(range.start).toBe(
			new Date(2025, 7, 25, 0, 0, 0, 0).getTime(),
		);
		expect(range.end).toBe(
			new Date(2026, 7, 25, 23, 59, 59, 999).getTime(),
		);

		vi.useRealTimers();
	});

	it("shifts month/year/fy anchors", () => {
		const anchor = new Date(2026, 7, 25);
		expect(shiftAnalysisAnchor("MONTH", anchor, -1).getMonth()).toBe(6);
		expect(shiftAnalysisAnchor("YEAR", anchor, -1).getFullYear()).toBe(2025);
		expect(shiftAnalysisAnchor("FY", anchor, 1).getFullYear()).toBe(2027);
	});

	it("does not shift for ALL and CUSTOM", () => {
		const anchor = new Date(2026, 7, 25);
		expect(shiftAnalysisAnchor("ALL", anchor, -1)).toEqual(anchor);
		expect(shiftAnalysisAnchor("CUSTOM", anchor, 1)).toEqual(anchor);
	});

	it("clamps shifts by min/max boundaries", () => {
		const anchor = new Date(2026, 7, 25);
		const minDate = new Date(2026, 7, 1).getTime();
		const maxDate = new Date(2026, 7, 31).getTime();

		// month clamp backward and forward
		expect(shiftAnalysisAnchor("MONTH", anchor, -1, minDate, maxDate)).toEqual(anchor);
		expect(shiftAnalysisAnchor("MONTH", anchor, 1, minDate, maxDate)).toEqual(anchor);

		// year/fy clamp backward and forward
		expect(shiftAnalysisAnchor("YEAR", anchor, -1, minDate, maxDate)).toEqual(anchor);
		expect(shiftAnalysisAnchor("YEAR", anchor, 1, minDate, maxDate)).toEqual(anchor);
		expect(shiftAnalysisAnchor("FY", anchor, -1, minDate, maxDate)).toEqual(anchor);
		expect(shiftAnalysisAnchor("FY", anchor, 1, minDate, maxDate)).toEqual(anchor);
	});

	it("normalizes custom ranges and formats output", () => {
		const startAt = new Date(2026, 7, 30, 22, 12, 5, 11).getTime();
		const endAt = new Date(2026, 7, 20, 2, 1, 1, 1).getTime();
		const range = getCustomDateRange(startAt, endAt);

		expect(range.start).toBe(new Date(2026, 7, 20, 0, 0, 0, 0).getTime());
		expect(range.end).toBe(new Date(2026, 7, 30, 23, 59, 59, 999).getTime());

		expect(formatDate(range.start)).toContain("2026");
		expect(formatDateTime(range.end)).toContain("2026");
	});
});
