import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "./colors.config";
import { CENTER, LARGE_FONT_SIZE } from "./constants.config";

const CheckButton = ({
	onClick,
	enabled,
}: {
	onClick?: () => void;
	enabled?: boolean;
}) =>
	onClick && (
		<TouchableOpacity
			style={{ alignSelf: CENTER }}
			onPress={onClick}
			disabled={!enabled}
			testID={"check_icon"}
		>
			<FontAwesome
				name="check"
				size={LARGE_FONT_SIZE * 1.6}
				color={enabled ? PRIMARY_COLOR : DISABLED_COLOR}
			/>
		</TouchableOpacity>
	);

export default CheckButton;
