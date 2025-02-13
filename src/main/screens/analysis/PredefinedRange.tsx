import { View } from "react-native";
import CustomButton from "../../components/buttons/CustomButton";
import {
	FLEX_ROW,
	FONT_SIZE,
	SCREEN_WIDTH,
	SPACE_EVENLY,
} from "../../constants/constants.config";
import { convertDateToString } from "../../util/HelperFunctions";

const PredefinedRange = ({
	setCustomStartDate,
	setCustomEndDate,
}: {
	setCustomStartDate: (_: string) => void;
	setCustomEndDate: (_: string) => void;
}) => {
	const predefinedRanges = getPredefinedRanges();
	return (
		<View
			style={{
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_EVENLY,
			}}
		>
			{Object.keys(predefinedRanges).map((date) => (
				<CustomButton
					text={date}
					width={SCREEN_WIDTH / 5}
					fontSize={FONT_SIZE / 1.8}
					key={date}
					onPress={() => {
						const { start, end } = predefinedRanges[date];
						setCustomStartDate(convertDateToString(start));
						setCustomEndDate(convertDateToString(end));
					}}
				/>
			))}
		</View>
	);
};

const getPredefinedRanges = (): Record<string, { start: Date; end: Date }> => {
	const now: Date = new Date(),
		year: number = now.getFullYear(),
		month: number = now.getMonth();
	const toTimestamp = (
		y: number,
		m: number,
		d: number,
		h: number = 0,
		i: number = 0,
		s: number = 0,
	): Date => new Date(y, m, d, h, i, s);

	return {
		[`This Month`]: {
			start: toTimestamp(year, month, 1),
			end: toTimestamp(year, month + 1, 0, 23, 59, 59),
		},
		[`Last Month`]: {
			start: toTimestamp(year, month - 1, 1),
			end: toTimestamp(year, month, 0, 23, 59, 59),
		},
		[`This Year`]: {
			start: toTimestamp(year, 0, 1),
			end: toTimestamp(year, 11, 31, 23, 59, 59),
		},
		[`Last Year`]: {
			start: toTimestamp(year - 1, 0, 1),
			end: toTimestamp(year - 1, 11, 31, 23, 59, 59),
		},
	};
};

export default PredefinedRange;
