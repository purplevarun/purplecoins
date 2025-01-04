import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import CustomText from "../CustomText";
import { formatMoney } from "../HelperFunctions";
import { sourceRoutes } from "../Routes";
import { SECONDARY_COLOR } from "../colors.config";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../constants.config";
import ISource from "./ISource";

const SourceRenderItem = ({
	item: { id, name, amount },
}: {
	item: ISource;
}) => {
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
			onPress={() => navigate(sourceRoutes.detail, { id })}
		>
			<CustomText text={name} />
			<CustomText text={formatMoney(amount)} />
		</TouchableOpacity>
	);
};

export default SourceRenderItem;
