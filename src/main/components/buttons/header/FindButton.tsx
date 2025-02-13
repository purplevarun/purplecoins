import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DimensionValue, TouchableOpacity } from "react-native";
import { PRIMARY_COLOR } from "../../../constants/colors.config";
import {
	CENTER,
	LARGE_FONT_SIZE,
	MARGIN,
} from "../../../constants/constants.config";

const FindButton = ({
	onClick,
	bottom,
}: {
	onClick?: () => void;
	bottom?: DimensionValue;
}) =>
	onClick && (
		<TouchableOpacity
			style={{ alignSelf: CENTER, bottom, right: MARGIN }}
			onPress={onClick}
			disabled={false}
			testID={"find_icon"}
		>
			<FontAwesome
				name="search"
				size={LARGE_FONT_SIZE * 1.4}
				color={PRIMARY_COLOR}
			/>
		</TouchableOpacity>
	);

export default FindButton;
