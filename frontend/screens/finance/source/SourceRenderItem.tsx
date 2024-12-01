import { formatMoney } from "../../../util/helpers/HelperFunctions";
import { ISource } from "../../../util/database/DatabaseSchema";
import { TouchableOpacity } from "react-native";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import { BORDER_RADIUS, FLEX_ROW, MARGIN, PADDING, SPACE_BETWEEN } from "../../../config/constants.config";
import CustomText from "../../../components/CustomText";

const SourceRenderItem = ({ item }: { item: ISource }) => {
	return (
		<TouchableOpacity
			style={{
				backgroundColor: SECONDARY_COLOR,
				borderRadius: BORDER_RADIUS,
				padding: PADDING,
				margin: MARGIN,
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN
			}}
		>
			<CustomText text={item.name} />
			<CustomText
				text={formatMoney(item.currentAmount)}
			/>
		</TouchableOpacity>
	);
};

export default SourceRenderItem;