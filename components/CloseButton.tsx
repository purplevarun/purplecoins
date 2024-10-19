import { FONT_SIZE, HEADER_ICON_SIZE } from "../config/dimensions.config";
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
				size={HEADER_ICON_SIZE * 1.2}
				color={RED_COLOR}
			/>
		</TouchableOpacity>
	);
};

export default CloseButton;
