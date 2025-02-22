import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";
import { PRIMARY_COLOR } from "./colors.config";
import { CENTER, LARGE_FONT_SIZE, MARGIN } from "./constants.config";

const FindButton = ({ onClick }: { onClick?: () => void }) =>
	onClick && (
		<TouchableOpacity
			style={{ alignSelf: CENTER, bottom: MARGIN / 1.5, right: MARGIN }}
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
