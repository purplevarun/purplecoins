import { View } from "react-native";
import { CENTER, PADDING, SMALL_FONT_SIZE } from "./constants.config";
import CustomText from "./CustomText";
import { RED_COLOR } from "./colors.config";
import Vertical from "./Vertical";

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
