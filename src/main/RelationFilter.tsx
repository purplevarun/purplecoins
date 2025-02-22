import { View } from "react-native";
import CustomInput from "./CustomInput";
import { FLEX_ROW, PADDING, SPACE_EVENLY } from "./constants.config";

const RelationFilter = ({
	showFilter,
	startDate,
	setStartDate,
	endDate,
	setEndDate,
}: {
	showFilter: boolean;
	startDate: string;
	endDate: string;
	setStartDate: (_: string) => void;
	setEndDate: (_: string) => void;
}) =>
	showFilter && (
		<View
			style={{
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_EVENLY,
				marginBottom: PADDING,
			}}
		>
			<CustomInput
				value={startDate}
				name={"Start Date"}
				setValue={setStartDate}
				width={"45%"}
				autoFocus
			/>
			<CustomInput
				value={endDate}
				name={"End Date"}
				setValue={setEndDate}
				width={"45%"}
			/>
		</View>
	);

export default RelationFilter;
