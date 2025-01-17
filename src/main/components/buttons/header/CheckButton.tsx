import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";
import {
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "../../../constants/colors.config";
import { CENTER, LARGE_FONT_SIZE } from "../../../constants/constants.config";

const CheckButton = ({
	handleCheck,
	enabled,
}: {
	handleCheck?: () => void;
	enabled?: boolean;
}) =>
	handleCheck && (
		<TouchableOpacity
			style={{ alignSelf: CENTER }}
			onPress={handleCheck}
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
