import { formatMoney } from "../../HelperFunctions";
import { TouchableOpacity } from "react-native";
import { SECONDARY_COLOR } from "../../config/colors.config";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../config/constants.config";
import CustomText from "../../components/CustomText";
import ISource from "../../interfaces/ISource";
import { useNavigation } from "@react-navigation/native";
import Routes from "../../Routes";

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
			onPress={() =>
				navigate(Routes.Source.Detail, { sourceId: item.id })
			}
		>
			<CustomText text={item.name} />
			<CustomText text={formatMoney(item.currentAmount)} />
		</TouchableOpacity>
	);
};

export default SourceRenderItem;
