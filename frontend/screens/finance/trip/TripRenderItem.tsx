import { ITrip } from "../../../util/database/DatabaseSchema";
import { TouchableOpacity, View } from "react-native";
import { BORDER_RADIUS, FLEX_ROW, MARGIN, PADDING, SPACE_BETWEEN } from "../../../config/constants.config";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import CustomText from "../../../components/CustomText";
import { formatDate } from "../../../util/helpers/HelperFunctions";

const TripRenderItem = ({ item }: { item: ITrip }) => (
	<TouchableOpacity
		style={{
			borderRadius: BORDER_RADIUS,
			padding: PADDING,
			margin: MARGIN,
			flexDirection: FLEX_ROW,
			justifyContent: SPACE_BETWEEN,
			backgroundColor: SECONDARY_COLOR
		}}
	>
		<CustomText text={item.name} />
		<View>
			<CustomText
				text={formatDate(item.startDate)}
				alignSelf={"flex-end"}
			/>
			<CustomText
				text={formatDate(item.endDate)}
				alignSelf={"flex-end"}
			/>
		</View>
	</TouchableOpacity>
);

export default TripRenderItem;