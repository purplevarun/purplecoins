import CustomText from "@/components/CustomText";
import COLORS from "@/constants/colors";
import { Fragment } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

export type BarDatum = Readonly<{
	label: string;
	value: number;
	color?: string;
}>;

type BarChartProps = Readonly<{
	data: readonly BarDatum[];
	title: string;
	formatValue?: (v: number) => string;
	positiveColor?: string;
	negativeColor?: string;
	height?: number;
}>;

const BAR_WIDTH = 36;
const BAR_GAP = 14;
const CHART_HEIGHT = 140;
const LABEL_HEIGHT = 28;
const SVG_PADDING_TOP = 6;

const BarChart = ({
	data,
	title,
	formatValue,
	positiveColor = COLORS.primary,
	negativeColor = COLORS.danger,
	height = CHART_HEIGHT,
}: BarChartProps): React.JSX.Element => {
	if (!data.length) {
		return (
			<View style={styles.empty}>
				<CustomText style={styles.emptyText}>No data</CustomText>
			</View>
		);
	}

	const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 1);
	const svgWidth = data.length * (BAR_WIDTH + BAR_GAP) + BAR_GAP;

	return (
		<View>
			<CustomText style={styles.title}>{title}</CustomText>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<Svg
					height={height + LABEL_HEIGHT + SVG_PADDING_TOP}
					width={svgWidth}
				>
					{/* baseline */}
					<Line
						stroke={COLORS.border}
						strokeWidth={1}
						x1={0}
						x2={svgWidth}
						y1={SVG_PADDING_TOP + height}
						y2={SVG_PADDING_TOP + height}
					/>
					{data.map((d, i) => {
						const x = BAR_GAP + i * (BAR_WIDTH + BAR_GAP);
						const barH = Math.max(
							2,
							(Math.abs(d.value) / maxAbs) * height,
						);
						const y = SVG_PADDING_TOP + height - barH;
						const color =
							d.color ??
							(d.value >= 0 ? positiveColor : negativeColor);
						const labelText = d.label;
						return (
							<Fragment key={d.label}>
								<Rect
									fill={color}
									height={barH}
									opacity={0.85}
									rx={4}
									width={BAR_WIDTH}
									x={x}
									y={y}
								/>
								<SvgText
									fill={COLORS.textMuted}
									fontSize={9}
									textAnchor="middle"
									x={x + BAR_WIDTH / 2}
									y={
										SVG_PADDING_TOP +
										height +
										LABEL_HEIGHT -
										10
									}
								>
									{labelText}
								</SvgText>
							</Fragment>
						);
					})}
				</Svg>
			</ScrollView>
			{formatValue ? (
				<View style={styles.legend}>
					{data.slice(-3).map((d) => (
						<CustomText key={d.label} style={styles.legendText}>
							{d.label}: {formatValue(d.value)}
						</CustomText>
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
		gap: 8,
		marginTop: 6,
	},
	legendText: {
		fontSize: 11,
		color: COLORS.textDim,
	},
});

export default BarChart;
