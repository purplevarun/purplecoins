import FontAwesome from "@expo/vector-icons/FontAwesome";
import { TouchableOpacity } from "react-native";
import { DISABLED_COLOR, PRIMARY_COLOR } from "../../../../../colors.config";
import { FONT_SIZE } from "../../../../../constants.config";
import Service from "../../../constants/enums/Service";
import ITabButton from "./ITabButton";

const SourceButton: ITabButton = ({ active, navigate }) => {
	return (
		<TouchableOpacity
			onPress={() => navigate(Service.SOURCE)}
			testID={"source_icon"}
		>
			<FontAwesome
				name={"bank"}
				size={FONT_SIZE * 2}
				color={active ? PRIMARY_COLOR : DISABLED_COLOR}
			/>
		</TouchableOpacity>
	);
};

export default SourceButton;
