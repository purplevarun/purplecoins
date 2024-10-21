import CategoryModel from "../../../models/CategoryModel";
import { Animated, TouchableOpacity } from "react-native";
import { SECONDARY_COLOR } from "../../../config/colors.config";
import {
	BORDER_RADIUS,
	MARGIN,
	PADDING,
} from "../../../config/constants.config";
import CustomText from "../../../components/CustomText";

const CategoryRenderItem = ({ item }: { item: CategoryModel }) => (
	<TouchableOpacity
		style={{
			backgroundColor: SECONDARY_COLOR,
			borderRadius: BORDER_RADIUS,
			padding: PADDING,
			margin: MARGIN,
		}}
	>
		<Animated.View>
			<CustomText text={item.name} />
		</Animated.View>
	</TouchableOpacity>
);

export default CategoryRenderItem;
