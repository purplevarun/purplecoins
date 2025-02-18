import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { TouchableOpacity } from "react-native";
import ITabButton from "./ITabButton";
import Service from "./Service";
import { DISABLED_COLOR, PRIMARY_COLOR } from "./colors.config";
import { FONT_SIZE } from "./constants.config";

const TripButton: ITabButton = ({ active, navigate }) => {
	return (
		<TouchableOpacity
			onPress={() => navigate(Service.TRIP)}
			testID={"trip_icon"}
		>
			<FontAwesome6
				name={"plane-up"}
				size={FONT_SIZE * 2}
				color={active ? PRIMARY_COLOR : DISABLED_COLOR}
			/>
		</TouchableOpacity>
	);
};

export default TripButton;
