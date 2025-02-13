import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";
import { PRIMARY_COLOR } from "../../../constants/colors.config";
import { CENTER, LARGE_FONT_SIZE } from "../../../constants/constants.config";

const CloseButton = ({ onClick }: { onClick?: () => void }) =>
	onClick && (
		<TouchableOpacity
			style={{ alignSelf: CENTER, bottom: 1 }}
			onPress={onClick}
			testID={"close_icon"}
		>
			<FontAwesome
				name="close"
				size={LARGE_FONT_SIZE * 1.6}
				color={PRIMARY_COLOR}
			/>
		</TouchableOpacity>
	);

export default CloseButton;
