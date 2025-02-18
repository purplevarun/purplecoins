import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { TouchableOpacity } from "react-native";
import {
	DISABLED_COLOR,
	PRIMARY_COLOR,
} from "./colors.config";
import { FONT_SIZE } from "./constants.config";
import Service from "./Service";
import ITabButton from "./ITabButton";

const TransactionButton: ITabButton = ({ active, navigate }) => {
	return (
		<TouchableOpacity
			onPress={() => navigate(Service.TRANSACTION)}
			testID={"transaction_icon"}
		>
			<FontAwesome6
				name={"money-bill-transfer"}
				size={FONT_SIZE * 2}
				color={active ? PRIMARY_COLOR : DISABLED_COLOR}
			/>
		</TouchableOpacity>
	);
};

export default TransactionButton;
