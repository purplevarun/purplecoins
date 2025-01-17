import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { TouchableOpacity } from "react-native";
import {
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "../../../constants/colors.config";
import { FONT_SIZE } from "../../../constants/constants.config";
import Service from "../../../constants/enums/Service";
import ITabButton from "./ITabButton";

const CategoryButton: ITabButton = ({ active, navigate }) => {
	return (
		<TouchableOpacity
			onPress={() => navigate(Service.CATEGORY)}
			testID={"category_icon"}
		>
			<FontAwesome6
				name={"list"}
				size={FONT_SIZE * 2}
				color={active ? PRIMARY_COLOR : DISABLED_COLOR}
			/>
		</TouchableOpacity>
	);
};

export default CategoryButton;
