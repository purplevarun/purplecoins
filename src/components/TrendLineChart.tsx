import CustomText from "@/components/CustomText";
import COLORS from "@/constants/colors";
import type TrendPoint from "@/types/TrendPoint";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Polyline } from "react-native-svg";

const CHART_WIDTH = 300;
const CHART_HEIGHT = 160;
const PLOT_LEFT = 32;
const PLOT_RIGHT = CHART_WIDTH - 8;
const PADDING_Y = 10;

const MIN_AXIS_VALUE = 100_000; // 1 lac
const MAX_AXIS_VALUE = 10_000_000; // 1 cr

const AXIS_TICKS = [
	100_000, 2_500_000, 5_000_000, 7_500_000, 10_000_000,
] as const;

type TrendSeriesKey = "income" | "expenses" | "networth";

type TrendSeriesConfig = Readonly<{
	key: TrendSeriesKey;
	label: string;
	color: string;
}>;

const TREND_SERIES_CONFIG: readonly TrendSeriesConfig[] = [
	{ key: "income", label: "Income", color: COLORS.success },
	{ key: "expenses", label: "Expenses", color: COLORS.danger },
	{ key: "networth", label: "Net worth", color: COLORS.primaryBright },
];

const formatAxisValue = (value: number): string =>
	value >= 10_000_000 ? `${value / 10_000_000}Cr` : `${value / 100_000}L`;

const getX = (index: number, count: number): number => {
	if (count <= 1) return (PLOT_LEFT + PLOT_RIGHT) / 2;
	return PLOT_LEFT + (index / (count - 1)) * (PLOT_RIGHT - PLOT_LEFT);
};

// The Y axis is fixed to 1 lac – 1 cr; values outside that band are clamped to the nearest edge.
const getY = (value: number): number => {
	const clampedValue = Math.min(
		MAX_AXIS_VALUE,
		Math.max(MIN_AXIS_VALUE, value),
	);
	const ratio =
		(clampedValue - MIN_AXIS_VALUE) / (MAX_AXIS_VALUE - MIN_AXIS_VALUE);
	return CHART_HEIGHT - PADDING_Y - ratio * (CHART_HEIGHT - PADDING_Y * 2);
};

const getSeriesPoints = (
	series: readonly TrendPoint[],
	key: TrendSeriesKey,
): string =>
	series
		.map(
			(point, index) =>
				`${getX(index, series.length)},${getY(Number(point[key]))}`,
		)
		.join(" ");

const TrendLineChart = ({
	series,
}: {
	series: readonly TrendPoint[];
}): React.JSX.Element => (
	<View style={styles.container}>
		<View style={styles.legendRow}>
			{TREND_SERIES_CONFIG.map((config) => (
				<View key={config.key} style={styles.legendItem}>
					<View
						style={[
							styles.legendDot,
							{ backgroundColor: config.color },
						]}
					/>
					<CustomText style={styles.legendLabel}>
						{config.label}
					</CustomText>
				</View>
			))}
		</View>
		<View style={styles.chartArea}>
			<Svg height={CHART_HEIGHT} width={CHART_WIDTH}>
				{AXIS_TICKS.map((tick) => (
					<Line
						key={tick}
						stroke="rgba(255,255,255,0.08)"
						strokeWidth={1}
						x1={PLOT_LEFT}
						x2={PLOT_RIGHT}
						y1={getY(tick)}
						y2={getY(tick)}
					/>
				))}
				{TREND_SERIES_CONFIG.map((config) => (
					<Polyline
						key={config.key}
						fill="none"
						points={getSeriesPoints(series, config.key)}
						stroke={config.color}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
					/>
				))}
			</Svg>
			<View pointerEvents="none" style={styles.axisLabels}>
				{AXIS_TICKS.map((tick) => (
					<CustomText
						key={tick}
						style={[styles.axisLabel, { top: getY(tick) - 7 }]}
					>
						{formatAxisValue(tick)}
					</CustomText>
				))}
			</View>
		</View>
		<View style={styles.xAxisRow}>
			{series.map((point, index) => (
				<CustomText
					key={point.year}
					style={[
						styles.xAxisLabel,
						{ left: getX(index, series.length) - 14 },
					]}
				>
					{point.year}
				</CustomText>
			))}
		</View>
	</View>
);

const styles = StyleSheet.create({
	container: {
		gap: 10,
	},
	legendRow: {
		flexDirection: "row",
		gap: 14,
		flexWrap: "wrap",
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	legendLabel: {
		color: COLORS.textMuted,
		fontSize: 11,
		fontWeight: "700",
	},
	chartArea: {
		position: "relative",
	},
	axisLabels: {
		position: "absolute",
		top: 0,
		left: 0,
		width: PLOT_LEFT,
		height: CHART_HEIGHT,
	},
	axisLabel: {
		position: "absolute",
		left: 0,
		color: COLORS.textDim,
		fontSize: 9,
	},
	xAxisRow: {
		height: 16,
		position: "relative",
	},
	xAxisLabel: {
		position: "absolute",
		color: COLORS.textDim,
		fontSize: 10,
	},
});

export default TrendLineChart;
export {
	AXIS_TICKS,
	formatAxisValue,
	getSeriesPoints,
	getX,
	getY,
	MAX_AXIS_VALUE,
	MIN_AXIS_VALUE,
};
