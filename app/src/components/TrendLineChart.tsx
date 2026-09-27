import CustomText from "@/components/CustomText";
import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type ChartBounds from "@/types/ChartBounds";
import type TrendLineChartProps from "@/types/TrendLineChartProps";
import type TrendPoint from "@/types/TrendPoint";
import type TrendSeriesConfig from "@/types/TrendSeriesConfig";
import type TrendSeriesKey from "@/types/TrendSeriesKey";
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
	const ratio = (value - safeMin) / (safeMax - safeMin);
	return CHART_HEIGHT - PADDING_Y - ratio * (CHART_HEIGHT - PADDING_Y * 2);
};

const getChartBounds = (series: readonly TrendPoint[]): ChartBounds => {
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

const TrendLineChart = ({ series }: TrendLineChartProps): React.JSX.Element => {
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

const {
	ALIGN,
	FLEX,
	FONT_SIZE,
	FONT_WEIGHT,
	POSITION,
	RADIUS,
	SIZES,
	SPACING,
} = styleConstants;

const styles = StyleSheet.create({
	container: {
		gap: SPACING.S10,
	},
	legendRow: {
		flexDirection: FLEX.ROW,
		gap: SPACING.S14,
		flexWrap: FLEX.WRAP,
	},
	legendItem: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		gap: SPACING.S6,
	},
	legendDot: {
		width: SIZES.S8,
		height: SIZES.S8,
		borderRadius: RADIUS.S4,
	},
	legendLabel: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S11,
		fontWeight: FONT_WEIGHT.BOLD,
	},
	chartArea: {
		position: POSITION.RELATIVE,
	},
	axisLabels: {
		position: POSITION.ABSOLUTE,
		top: SPACING.S0,
		left: SPACING.S0,
		width: PLOT_LEFT,
		height: CHART_HEIGHT,
	},
	axisLabel: {
		position: POSITION.ABSOLUTE,
		left: SPACING.S0,
		color: COLORS.textDim,
		fontSize: FONT_SIZE.S9,
	},
	xAxisRow: {
		height: SIZES.S16,
		position: POSITION.RELATIVE,
	},
	xAxisLabel: {
		position: POSITION.ABSOLUTE,
		color: COLORS.textDim,
		fontSize: FONT_SIZE.S10,
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
