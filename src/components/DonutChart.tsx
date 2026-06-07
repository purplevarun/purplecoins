import { CustomText } from "@/components/CustomText";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { COLORS } from "@/constants/colors";
import type { ChartDatum } from "@/types/ChartDatum";

type DonutChartProps = Readonly<{
	data: readonly ChartDatum[];
	centerLabel: string;
}>;

const CHART_SIZE = 190;
const STROKE_WIDTH = 24;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
						r={RADIUS}
						stroke="rgba(255,255,255,0.06)"
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
										r={RADIUS}
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

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		gap: 16,
	},
	chart: {
		width: CHART_SIZE,
		height: CHART_SIZE,
		alignItems: "center",
		justifyContent: "center",
	},
	center: {
		position: "absolute",
		alignItems: "center",
		maxWidth: 120,
	},
	centerLabel: {
		color: COLORS.text,
		fontSize: 16,
		fontWeight: "900",
		textAlign: "center",
	},
	centerSubLabel: {
		color: COLORS.textMuted,
		fontSize: 10,
		textAlign: "center",
		marginTop: 2,
	},
	legend: {
		width: "100%",
		gap: 7,
	},
	legendRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	legendDot: {
		width: 9,
		height: 9,
		borderRadius: 5,
	},
	legendLabel: {
		color: COLORS.textMuted,
		fontSize: 12,
		flex: 1,
	},
});

export { DonutChart };
