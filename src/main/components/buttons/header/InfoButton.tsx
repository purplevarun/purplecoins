import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { TouchableOpacity } from "react-native";
import { PRIMARY_COLOR } from "../../../constants/colors.config";
import {
	CENTER,
	LARGE_FONT_SIZE,
	MARGIN,
} from "../../../constants/constants.config";

const InfoButton = ({ onClick }: { onClick?: () => void }) =>
	onClick && (
		<TouchableOpacity
			style={{
				alignSelf: CENTER,
				bottom: MARGIN / 1.5,
				right: MARGIN * 3,
			}}
			onPress={onClick}
			testID={"info_icon"}
		>
			<FontAwesome6
				name="chart-pie"
				size={LARGE_FONT_SIZE * 1.3}
				color={PRIMARY_COLOR}
			/>
		</TouchableOpacity>
	);

export default InfoButton;
