import { TouchableOpacity } from "react-native";
import { ABSOLUTE, FLEX_END, FONT_SIZE, PADDING } from "../config/constants.config";
import { YELLOW_COLOR } from "../config/colors.config";
import { EDIT_ICON } from "../config/icons.config";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const EditButton = ({ onPress }: { onPress: () => void }) => {
	return (
		<TouchableOpacity
			style={{
				alignSelf: FLEX_END,
				position: ABSOLUTE,
				padding: PADDING,
				paddingRight: PADDING / 2
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