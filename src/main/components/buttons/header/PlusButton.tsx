import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";
import { PRIMARY_COLOR } from "../../../constants/colors.config";
import { CENTER, LARGE_FONT_SIZE } from "../../../constants/constants.config";

const PlusButton = ({ onClick }: { onClick?: () => void }) =>
	onClick && (
		<TouchableOpacity
			style={{ alignSelf: CENTER }}
			onPress={onClick}
			testID={"plus_icon"}
		>
			<FontAwesome
				name="plus"
				size={LARGE_FONT_SIZE * 1.6}
				color={PRIMARY_COLOR}
			/>
		</TouchableOpacity>
	);

export default PlusButton;
