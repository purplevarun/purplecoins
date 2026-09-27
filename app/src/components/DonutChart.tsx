import CustomText from "@/components/CustomText";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import COLORS from "@/constants/colors";
import styleConstants from "@/constants/styleConstants";
import type DonutChartProps from "@/types/DonutChartProps";

const CHART_SIZE = 190;
const STROKE_WIDTH = 24;
const CHART_RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * CHART_RADIUS;

const DonutChart = ({
	data,
	centerLabel,
}: DonutChartProps): React.JSX.Element => {
	const total = data.reduce((sum, datum) => sum + datum.value, 0);
	let accumulatedFraction = 0;

	return (
		<View style={styles.container}>
			<View style={styles.chart}>
				<Svg height={CHART_SIZE} width={CHART_SIZE}>
					<Circle
						cx={CHART_SIZE / 2}
						cy={CHART_SIZE / 2}
						fill="transparent"
						r={CHART_RADIUS}
						stroke={COLORS.surfaceHigh}
						strokeWidth={STROKE_WIDTH}
					/>
					{total > 0
						? data.map((datum) => {
								const fraction = datum.value / total;
								const dashLength = fraction * CIRCUMFERENCE;
								const dashOffset =
									-accumulatedFraction * CIRCUMFERENCE;
								accumulatedFraction += fraction;
								return (
									<Circle
										key={datum.label}
										cx={CHART_SIZE / 2}
										cy={CHART_SIZE / 2}
										fill="transparent"
										r={CHART_RADIUS}
										rotation="-90"
										origin={`${CHART_SIZE / 2}, ${CHART_SIZE / 2}`}
										stroke={datum.color}
										strokeDasharray={`${dashLength} ${CIRCUMFERENCE - dashLength}`}
										strokeDashoffset={dashOffset}
										strokeLinecap="round"
										strokeWidth={STROKE_WIDTH}
									/>
								);
							})
						: null}
				</Svg>
				<View style={styles.center}>
					<CustomText style={styles.centerLabel}>
						{centerLabel}
					</CustomText>
					<CustomText style={styles.centerSubLabel}>
						category net
					</CustomText>
				</View>
			</View>
			<View style={styles.legend}>
				{data.slice(0, 6).map((datum) => (
					<View key={datum.label} style={styles.legendRow}>
						<View
							style={[
								styles.legendDot,
								{ backgroundColor: datum.color },
							]}
						/>
						<CustomText
							numberOfLines={1}
							style={styles.legendLabel}
						>
							{datum.label}
						</CustomText>
					</View>
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
		alignItems: ALIGN.CENTER,
		gap: SPACING.S16,
	},
	chart: {
		width: CHART_SIZE,
		height: CHART_SIZE,
		alignItems: ALIGN.CENTER,
		justifyContent: ALIGN.CENTER,
	},
	center: {
		position: POSITION.ABSOLUTE,
		alignItems: ALIGN.CENTER,
		maxWidth: SIZES.S120,
	},
	centerLabel: {
		color: COLORS.text,
		fontSize: FONT_SIZE.S16,
		fontWeight: FONT_WEIGHT.BLACK,
		textAlign: ALIGN.CENTER,
	},
	centerSubLabel: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S10,
		textAlign: ALIGN.CENTER,
		marginTop: SPACING.S2,
	},
	legend: {
		width: SIZES.FULL,
		gap: SPACING.S7,
	},
	legendRow: {
		flexDirection: FLEX.ROW,
		alignItems: ALIGN.CENTER,
		gap: SPACING.S8,
	},
	legendDot: {
		width: SIZES.S9,
		height: SIZES.S9,
		borderRadius: RADIUS.S5,
	},
	legendLabel: {
		color: COLORS.textMuted,
		fontSize: FONT_SIZE.S12,
		flex: FLEX.FILL,
	},
});

export default DonutChart;
