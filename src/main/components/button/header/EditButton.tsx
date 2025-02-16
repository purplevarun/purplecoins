import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";
import { PRIMARY_COLOR } from "../../../constants/config/colors.config";
import {
	CENTER,
	LARGE_FONT_SIZE,
} from "../../../constants/config/constants.config";

const EditButton = ({ onClick }: { onClick?: () => void }) =>
	onClick && (
		<TouchableOpacity
			style={{ alignSelf: CENTER }}
			onPress={onClick}
			testID={"edit_icon"}
		>
			<FontAwesome
				name="pencil-square"
				size={LARGE_FONT_SIZE * 1.5}
				color={PRIMARY_COLOR}
			/>
		</TouchableOpacity>
	);

export default EditButton;
