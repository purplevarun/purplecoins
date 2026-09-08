import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
	StyleSheet: { create: (styles: any) => styles },
	View: (props: any) => ({ type: "View", props }),
}));
vi.mock("react-native-svg", () => ({
	default: (props: any) => ({ type: "Svg", props }),
	Line: (props: any) => ({ type: "Line", props }),
	Polyline: (props: any) => ({ type: "Polyline", props }),
}));
vi.mock("@/components/CustomText", () => ({
	default: (props: any) => ({ type: "CustomText", props }),
}));

import TrendLineChart, {
	AXIS_TICKS,
	formatAxisValue,
	getSeriesPoints,
	getX,
	getY,
	MAX_AXIS_VALUE,
	MIN_AXIS_VALUE,
} from "@/components/TrendLineChart";
import type TrendPoint from "@/types/TrendPoint";

const findByPredicate = (
	node: any,
	predicate: (candidate: any) => boolean,
	acc: any[] = [],
): any[] => {
	if (!node) return acc;
	if (Array.isArray(node)) {
		node.forEach((child) => findByPredicate(child, predicate, acc));
		return acc;
	}
	if (predicate(node)) acc.push(node);
	if (node.props) {
		Object.values(node.props).forEach((value) =>
			findByPredicate(value, predicate, acc),
		);
	}
	return acc;
};

const series: readonly TrendPoint[] = [
	{ year: "2020", income: "100000", expenses: "40000", networth: "60000" },
	{
		year: "2021",
		income: "10000000",
		expenses: "20000000",
		networth: "-10000000",
	},
];

describe("TrendLineChart helpers", () => {
	it("keeps the default fallback axis bounds for empty series", () => {
		expect(MIN_AXIS_VALUE).toBe(100_000);
		expect(MAX_AXIS_VALUE).toBe(10_000_000);
		expect(AXIS_TICKS).toEqual([
			100_000, 2_500_000, 5_000_000, 7_500_000, 10_000_000,
		]);
	});

	it("formats axis values using lac/crore notation", () => {
		expect(formatAxisValue(100_000)).toBe("1L");
		expect(formatAxisValue(2_500_000)).toBe("25L");
		expect(formatAxisValue(10_000_000)).toBe("1Cr");
		expect(formatAxisValue(25_000_000)).toBe("2.5Cr");
	});

	it("computes x positions, defaulting to center for a single point", () => {
		expect(getX(0, 1)).toBe(162);
		expect(getX(0, 2)).toBe(32);
		expect(getX(1, 2)).toBe(292);
	});

	it("scales y positions from real chart bounds instead of a hardcoded range", () => {
		expect(getY(0, 0, 1_000_000)).toBe(150);
		expect(getY(500_000, 0, 1_000_000)).toBeCloseTo(80);
		expect(getY(1_000_000, 0, 1_000_000)).toBe(10);
	});

	it("builds a polyline points string for a series key", () => {
		expect(getSeriesPoints(series, "income", 0, 10_000_000)).toContain(
			"32,",
		);
		expect(getSeriesPoints(series, "income", 0, 10_000_000)).toContain(
			"292,",
		);
	});
});

describe("TrendLineChart", () => {
	it("renders a legend entry, a grid line per tick, a polyline per series, and a label per year", () => {
		const tree = TrendLineChart({ series });
		const polylines = findByPredicate(
			tree,
			(node) => typeof node?.props?.points === "string",
		);
		expect(polylines).toHaveLength(3);
		const gridLines = findByPredicate(
			tree,
			(node) => typeof node?.props?.x1 === "number",
		);
		expect(gridLines).toHaveLength(AXIS_TICKS.length);
		const legendLabels = findByPredicate(
			tree,
			(node) =>
				node?.props?.children === "Income" ||
				node?.props?.children === "Expenses" ||
				node?.props?.children === "Net worth",
		);
		expect(legendLabels).toHaveLength(3);
		const yearLabels = findByPredicate(
			tree,
			(node) =>
				node?.props?.children === "2020" ||
				node?.props?.children === "2021",
		);
		expect(yearLabels).toHaveLength(2);
	});

	it("renders a single year without dividing by zero", () => {
		const tree = TrendLineChart({
			series: [
				{ year: "2024", income: "0", expenses: "0", networth: "0" },
			],
		});
		const yearLabels = findByPredicate(
			tree,
			(node) => node?.props?.children === "2024",
		);
		expect(yearLabels).toHaveLength(1);
	});
});
