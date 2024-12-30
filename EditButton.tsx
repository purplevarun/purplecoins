import { TouchableOpacity } from "react-native";
import { FONT_SIZE, PADDING } from "./constants.config";
import { YELLOW_COLOR } from "./colors.config";
import { EDIT_ICON } from "./icons.config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const EditButton = ({ onPress }: { onPress: () => void }) => {
	return (
		<TouchableOpacity
			style={{
				paddingVertical: PADDING,
			}}
			onPress={onPress}
		>
			<FontAwesome
				name={EDIT_ICON}
				size={FONT_SIZE * 2}
				color={YELLOW_COLOR}
			/>
		</TouchableOpacity>
	);
};

export default EditButton;
