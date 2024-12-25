import { View } from "react-native";
import { CENTER, PADDING, SMALL_FONT_SIZE } from "./config/constants.config";
import CustomText from "./components/CustomText";
import { RED_COLOR } from "./config/colors.config";
import Vertical from "./components/Vertical";

const ErrorMessage = ({ error }: { error: string }) => {
	return error.length > 0 ? (
		<View
			style={{
				justifyContent: CENTER,
				padding: PADDING,
			}}
		>
			<CustomText
				text={error}
				color={RED_COLOR}
				alignSelf={CENTER}
				fontSize={SMALL_FONT_SIZE}
			/>
		</View>
	) : (
		<Vertical size={4} />
	);
};

export default ErrorMessage;
