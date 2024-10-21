import { FONT_SIZE, LARGE_FONT_SIZE } from "../config/constants.config";
import { RED_COLOR } from "../config/colors.config";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const CloseButton = ({ path }: { path: string }) => {
	const { navigate } = useNavigation<any>();
	return (
		<TouchableOpacity
			style={{
				alignSelf: "flex-start",
				paddingTop: FONT_SIZE * 0.5,
			}}
			onPress={() => navigate(path)}
		>
			<FontAwesome
				name="window-close"
				size={LARGE_FONT_SIZE * 1.2}
				color={RED_COLOR}
			/>
		</TouchableOpacity>
	);
};

export default CloseButton;
