import type ChartDatum from "@/types/ChartDatum";

/** A single computed SVG ring segment for a donut/pie chart. */
type DonutSegment = Readonly<{
	label: string;
	color: string;
	/** Length (along the circle's circumference) of this segment's arc. */
	dashLength: number;
	/** Negative running offset so segments are drawn back-to-back. */
	dashOffset: number;
}>;

/**
 * Converts chart data into SVG `stroke-dasharray`/`stroke-dashoffset`-ready
 * segments proportional to each datum's share of the total. Returns an
 * empty array when there is no data or the total is zero (nothing to draw).
 */
const computeDonutSegments = (
	data: readonly ChartDatum[],
	circumference: number,
): readonly DonutSegment[] => {
	const total = data.reduce((sum, datum) => sum + datum.value, 0);
	if (total <= 0) {
		return [];
	}

	let accumulatedFraction = 0;
	return data.map((datum) => {
		const fraction = datum.value / total;
		const dashLength = fraction * circumference;
		const dashOffset = -accumulatedFraction * circumference;
		accumulatedFraction += fraction;
		return {
			label: datum.label,
			color: datum.color,
			dashLength,
			dashOffset,
		};
	});
};

const donutChartUtils = {
	computeDonutSegments,
};

export default donutChartUtils;
