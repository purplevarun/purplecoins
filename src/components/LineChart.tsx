import CustomText from "@/components/CustomText";
import COLORS from "@/constants/colors";
import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";

export type LineDatum = Readonly<{
	label: string;
	value: number;
}>;

export type LineSeries = Readonly<{
	key: string;
	data: readonly LineDatum[];
	color: string;
}>;

type LineChartProps = Readonly<{
	series: readonly LineSeries[];
	title: string;
	formatValue?: (v: number) => string;
	height?: number;
}>;

const CHART_HEIGHT = 120;
const CHART_WIDTH = 300;
const PADDING_LEFT = 8;
const PADDING_RIGHT = 8;
const PADDING_TOP = 8;
const LABEL_HEIGHT = 22;

const LineChart = ({
	series,
	title,
	formatValue,
	height = CHART_HEIGHT,
}: LineChartProps): React.JSX.Element => {
	const allValues = series.flatMap((s) => s.data.map((d) => d.value));
	if (!allValues.length) {
		return (
			<View style={styles.empty}>
				<CustomText style={styles.emptyText}>No data</CustomText>
			</View>
		);
	}

	const minVal = Math.min(...allValues);
	const maxVal = Math.max(...allValues);
	const range = Math.max(maxVal - minVal, 1);
	const labels =
		series[0]?.data.map((d) => d.label) ?? [];
	const count = labels.length;
	const plotWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
	const plotHeight = height - PADDING_TOP;

	const getX = (i: number): number =>
		PADDING_LEFT + (count <= 1 ? plotWidth / 2 : (i / (count - 1)) * plotWidth);
	const getY = (v: number): number =>
		PADDING_TOP + plotHeight - ((v - minVal) / range) * plotHeight;

	return (
		<View>
			<CustomText style={styles.title}>{title}</CustomText>
			<Svg height={height + LABEL_HEIGHT} width={CHART_WIDTH}>
				{/* horizontal grid line at midpoint */}
				<Line
					stroke={COLORS.border}
					strokeDasharray="4 4"
					strokeWidth={1}
					x1={PADDING_LEFT}
					x2={CHART_WIDTH - PADDING_RIGHT}
					y1={PADDING_TOP + plotHeight / 2}
					y2={PADDING_TOP + plotHeight / 2}
				/>
				{/* baseline */}
				<Line
					stroke={COLORS.border}
					strokeWidth={1}
					x1={PADDING_LEFT}
					x2={CHART_WIDTH - PADDING_RIGHT}
					y1={PADDING_TOP + plotHeight}
					y2={PADDING_TOP + plotHeight}
				/>
				{series.map((s) => {
					const points = s.data
						.map((d, i) => `${getX(i)},${getY(d.value)}`)
						.join(" ");
					return (
						<Fragment key={s.key}>
							<Polyline
								fill="none"
								points={points}
								stroke={s.color}
								strokeLinejoin="round"
								strokeWidth={2}
							/>
							{s.data.map((d, i) => (
								<Circle
									key={d.label}
									cx={getX(i)}
									cy={getY(d.value)}
									fill={s.color}
									r={3}
								/>
							))}
						</Fragment>
					);
				})}
				{/* x-axis labels */}
				{labels.map((label, i) => (
					<SvgText
						key={label}
						fill={COLORS.textDim}
						fontSize={9}
						textAnchor="middle"
						x={getX(i)}
						y={height + LABEL_HEIGHT - 6}
					>
						{label}
					</SvgText>
				))}
			</Svg>
			{/* legend */}
			{series.length > 1 ? (
				<View style={styles.legend}>
					{series.map((s) => (
						<View key={s.key} style={styles.legendRow}>
							<View
								style={[
									styles.legendDot,
									{ backgroundColor: s.color },
								]}
							/>
							<CustomText style={styles.legendLabel}>
								{formatValue
									? `${s.key}: ${formatValue(s.data.at(-1)?.value ?? 0)}`
									: s.key}
							</CustomText>
						</View>
					))}
				</View>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	title: {
		fontSize: 13,
		color: COLORS.textMuted,
		marginBottom: 10,
		letterSpacing: 0.5,
		textTransform: "uppercase",
	},
	empty: {
		alignItems: "center",
		paddingVertical: 16,
	},
	emptyText: {
		color: COLORS.textDim,
		fontSize: 13,
	},
	legend: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		marginTop: 6,
	},
	legendRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
	},
	legendDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
	},
	legendLabel: {
		fontSize: 11,
		color: COLORS.textMuted,
	},
});

export default LineChart;
