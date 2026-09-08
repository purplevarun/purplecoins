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

const formatAxisValue = (value: number): string => {
	const absoluteValue = Math.abs(value);
	if (absoluteValue >= 10_000_000) {
		return `${(value / 10_000_000).toFixed(1).replace(/\.0$/, "")}Cr`;
	}
	if (absoluteValue >= 100_000) {
		return `${(value / 100_000).toFixed(1).replace(/\.0$/, "")}L`;
	}
	return `${value}`;
};

const getX = (index: number, count: number): number => {
	if (count <= 1) return (PLOT_LEFT + PLOT_RIGHT) / 2;
	return PLOT_LEFT + (index / (count - 1)) * (PLOT_RIGHT - PLOT_LEFT);
};

const getY = (
	value: number,
	minValue: number = MIN_AXIS_VALUE,
	maxValue: number = MAX_AXIS_VALUE,
): number => {
	if (maxValue === minValue) {
		return CHART_HEIGHT - PADDING_Y;
	}
	const safeMin = Math.min(minValue, maxValue);
	const safeMax = Math.max(minValue, maxValue);
	const ratio =
		safeMax === safeMin ? 0 : (value - safeMin) / (safeMax - safeMin);
	return CHART_HEIGHT - PADDING_Y - ratio * (CHART_HEIGHT - PADDING_Y * 2);
};

const getChartBounds = (series: readonly TrendPoint[]) => {
	const values = series.flatMap((point) => [
		Number(point.income),
		Number(point.expenses),
		Number(point.networth),
	]);
	if (!values.length || values.every((value) => Number.isNaN(value))) {
		return { min: MIN_AXIS_VALUE, max: MAX_AXIS_VALUE };
	}
	const numericValues = values.filter((value) => Number.isFinite(value));
	const minValue = Math.min(...numericValues);
	const maxValue = Math.max(...numericValues);
	const spread = Math.max(maxValue - minValue, 100_000);
	return {
		min: Math.min(0, minValue - spread * 0.25),
		max: Math.max(0, maxValue + spread * 0.25),
	};
};

const getSeriesPoints = (
	series: readonly TrendPoint[],
	key: TrendSeriesKey,
	minValue: number = MIN_AXIS_VALUE,
	maxValue: number = MAX_AXIS_VALUE,
): string =>
	series
		.map(
			(point, index) =>
				`${getX(index, series.length)},${getY(Number(point[key]), minValue, maxValue)}`,
		)
		.join(" ");

const TrendLineChart = ({
	series,
}: {
	series: readonly TrendPoint[];
}): React.JSX.Element => {
	const chartBounds = getChartBounds(series);
	const axisTicks = Array.from(
		{ length: 5 },
		(_, index) =>
			chartBounds.min + ((chartBounds.max - chartBounds.min) * index) / 4,
	);

	return (
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
					{axisTicks.map((tick) => (
						<Line
							key={tick}
							stroke="rgba(255,255,255,0.08)"
							strokeWidth={1}
							x1={PLOT_LEFT}
							x2={PLOT_RIGHT}
							y1={getY(tick, chartBounds.min, chartBounds.max)}
							y2={getY(tick, chartBounds.min, chartBounds.max)}
						/>
					))}
					{TREND_SERIES_CONFIG.map((config) => (
						<Polyline
							key={config.key}
							fill="none"
							points={getSeriesPoints(
								series,
								config.key,
								chartBounds.min,
								chartBounds.max,
							)}
							stroke={config.color}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
						/>
					))}
				</Svg>
				<View pointerEvents="none" style={styles.axisLabels}>
					{axisTicks.map((tick) => (
						<CustomText
							key={tick}
							style={[
								styles.axisLabel,
								{
									top:
										getY(
											tick,
											chartBounds.min,
											chartBounds.max,
										) - 7,
								},
							]}
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
};

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
