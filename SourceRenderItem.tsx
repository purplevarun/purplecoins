import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import CustomText from "./CustomText";
import { formatMoney } from "./HelperFunctions";
import ISource from "./ISource";
import { SECONDARY_COLOR } from "./colors.config";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "./constants.config";

const SourceRenderItem = ({ item }: { item: ISource }) => {
	const { navigate } = useNavigation<any>();
	return (
		<TouchableOpacity
			style={{
				backgroundColor: SECONDARY_COLOR,
				borderRadius: BORDER_RADIUS,
				padding: PADDING,
				margin: MARGIN,
				flexDirection: FLEX_ROW,
				justifyContent: SPACE_BETWEEN,
			}}
			onPress={() => navigate("Source.Detail", { sourceId: item.id })}
		>
			<CustomText text={item.name} />
			<CustomText text={formatMoney(item.currentAmount)} />
		</TouchableOpacity>
	);
};

export default SourceRenderItem;
