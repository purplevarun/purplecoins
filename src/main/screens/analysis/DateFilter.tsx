import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { View } from "react-native";
import CustomInput from "../../components/CustomInput";
import FindButton from "../../components/buttons/header/FindButton";
import { PRIMARY_COLOR } from "../../constants/colors.config";
import {
	CENTER,
	FLEX_ROW,
	FONT_SIZE,
	MARGIN,
	PADDING,
	SPACE_EVENLY,
} from "../../constants/constants.config";
import useDatabase from "../../hooks/useDatabase";
import RelationWithTotal from "../../types/RelationWithTotal";
import { convertStringToDate } from "../../util/HelperFunctions";

const DateFilter = ({
	setRelations,
	customStartDate,
	customEndDate,
	setCustomStartDate,
	setCustomEndDate,
}: {
	setRelations: (_: RelationWithTotal[]) => void;
	customStartDate: string;
	customEndDate: string;
	setCustomStartDate: (_: string) => void;
	setCustomEndDate: (_: string) => void;
}) => {
	const { fetchBreakdown } = useDatabase();
	return (
		<View
			style={{
				justifyContent: SPACE_EVENLY,
				flexDirection: FLEX_ROW,
				marginBottom: PADDING,
			}}
		>
			<View
				style={{
					justifyContent: SPACE_EVENLY,
					flexDirection: FLEX_ROW,
				}}
			>
				<CustomInput
					name={"Start Date"}
					value={customStartDate}
					setValue={setCustomStartDate}
					width={"40%"}
				/>
				<FontAwesome6
					name="minus"
					size={FONT_SIZE}
					color={PRIMARY_COLOR}
					alignSelf={CENTER}
					top={MARGIN / 2}
				/>
				<CustomInput
					name={"End Date"}
					value={customEndDate}
					setValue={setCustomEndDate}
					width={"40%"}
				/>
			</View>
			<FindButton
				onClick={() =>
					setRelations(
						fetchBreakdown(
							convertStringToDate(customStartDate).getTime(),
							convertStringToDate(customEndDate).getTime(),
						),
					)
				}
			/>
		</View>
	);
};

export default DateFilter;
