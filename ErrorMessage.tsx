import { View } from "react-native";
import CustomText from "./CustomText";
import Vertical from "./Vertical";
import { RED_COLOR } from "./colors.config";
import { CENTER, PADDING, SMALL_FONT_SIZE } from "./constants.config";

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
