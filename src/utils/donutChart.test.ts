import donutChartUtils from "@/utils/donutChart";

import { describe, expect, it } from "vitest";

import type ChartDatum from "@/types/ChartDatum";

const { computeDonutSegments } = donutChartUtils;
const CIRCUMFERENCE = 2 * Math.PI * 100;

describe("computeDonutSegments", () => {
	it("returns an empty array for no data", () => {
		expect(computeDonutSegments([], CIRCUMFERENCE)).toEqual([]);
	});

	it("returns an empty array when every value is zero (nothing to draw)", () => {
		const data: readonly ChartDatum[] = [
			{ label: "A", value: 0, color: "red" },
			{ label: "B", value: 0, color: "blue" },
		];
		expect(computeDonutSegments(data, CIRCUMFERENCE)).toEqual([]);
	});

	it("gives a single datum the entire circumference with zero offset", () => {
		const data: readonly ChartDatum[] = [
			{ label: "A", value: 100, color: "red" },
		];

		const [segment] = computeDonutSegments(data, CIRCUMFERENCE);

		expect(segment?.dashLength).toBeCloseTo(CIRCUMFERENCE);
		expect(segment?.dashOffset).toBe(-0);
	});

	it("splits two equal values into two equal, back-to-back segments", () => {
		const data: readonly ChartDatum[] = [
			{ label: "A", value: 50, color: "red" },
			{ label: "B", value: 50, color: "blue" },
		];

		const segments = computeDonutSegments(data, CIRCUMFERENCE);

		expect(segments[0]?.dashLength).toBeCloseTo(CIRCUMFERENCE / 2);
		expect(segments[1]?.dashLength).toBeCloseTo(CIRCUMFERENCE / 2);
		expect(segments[0]?.dashOffset).toBe(-0);
		expect(segments[1]?.dashOffset).toBeCloseTo(-CIRCUMFERENCE / 2);
	});

	it("proportions three unequal values correctly and accumulates offsets", () => {
		const data: readonly ChartDatum[] = [
			{ label: "A", value: 100, color: "red" }, // 50%
			{ label: "B", value: 60, color: "blue" }, // 30%
			{ label: "C", value: 40, color: "green" }, // 20%
		];

		const segments = computeDonutSegments(data, CIRCUMFERENCE);

		expect(segments[0]?.dashLength).toBeCloseTo(CIRCUMFERENCE * 0.5);
		expect(segments[1]?.dashLength).toBeCloseTo(CIRCUMFERENCE * 0.3);
		expect(segments[2]?.dashLength).toBeCloseTo(CIRCUMFERENCE * 0.2);
		expect(segments[1]?.dashOffset).toBeCloseTo(-CIRCUMFERENCE * 0.5);
		expect(segments[2]?.dashOffset).toBeCloseTo(-CIRCUMFERENCE * 0.8);
	});

	it("preserves label and color on each segment", () => {
		const data: readonly ChartDatum[] = [
			{ label: "Rent", value: 10, color: "#ABC123" },
		];

		const [segment] = computeDonutSegments(data, CIRCUMFERENCE);

		expect(segment?.label).toBe("Rent");
		expect(segment?.color).toBe("#ABC123");
	});

	it("ignores negative-value data when summing the total (matches reduce semantics)", () => {
		// A negative value alongside a larger positive keeps the total positive,
		// exercising the reduce-based total rather than a naive Math.max check.
		const data: readonly ChartDatum[] = [
			{ label: "A", value: -10, color: "red" },
			{ label: "B", value: 30, color: "blue" },
		];

		const segments = computeDonutSegments(data, CIRCUMFERENCE);

		expect(segments).toHaveLength(2);
		expect(segments[0]?.dashLength).toBeCloseTo(CIRCUMFERENCE * (-10 / 20));
		expect(segments[1]?.dashLength).toBeCloseTo(CIRCUMFERENCE * (30 / 20));
	});
});
