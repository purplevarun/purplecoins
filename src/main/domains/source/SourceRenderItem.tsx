import { TouchableOpacity } from "react-native";
import CustomText from "../../../../CustomText";
import { formatMoney } from "../../../../HelperFunctions";
import { SECONDARY_COLOR } from "../../../../colors.config";
import {
	BORDER_RADIUS,
	FLEX_ROW,
	MARGIN,
	PADDING,
	SPACE_BETWEEN,
} from "../../../../constants.config";
import ISource from "./ISource";
import useSource from "./useSource";

const SourceRenderItem = ({ item }: { item: ISource }) => {
	return <Implementation item={item} />;
};

const Implementation = ({ item }: { item: ISource }) => {
	const { handleDetail } = useSource(item.id);
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
			onPress={handleDetail}
		>
			<CustomText text={item.name} />
			<CustomText text={formatMoney(item.amount)} />
		</TouchableOpacity>
	);
};

export default SourceRenderItem;
