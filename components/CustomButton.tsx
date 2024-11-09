import { DimensionValue, TouchableOpacity } from "react-native";
import {
	BORDER_RADIUS,
	PADDING,
	NINETY_P,
	CENTER,
	FONT_SIZE,
} from "../config/constants.config";
import { GREEN_COLOR } from "../config/colors.config";
import CustomText from "./CustomText";

interface ICustomButton {
	text?: string;
	onPress?: VoidFunction;
	width?: DimensionValue;
	disabled?: boolean;
}

const CustomButton = ({
	text = "Submit",
	onPress = () => {},
	width = NINETY_P,
	disabled = false,
}: ICustomButton) => {
	return (
		<TouchableOpacity
			style={{
				backgroundColor: GREEN_COLOR,
				padding: PADDING,
				borderRadius: BORDER_RADIUS,
				alignItems: CENTER,
				justifyContent: CENTER,
				opacity: disabled ? 0.5 : 1,
				width,
				marginVertical: FONT_SIZE,
				alignSelf: CENTER,
			}}
			onPress={onPress}
			disabled={disabled}
		>
			<CustomText text={text} alignSelf={CENTER} />
		</TouchableOpacity>
	);
};

export default CustomButton;
