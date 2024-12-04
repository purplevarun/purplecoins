import { DimensionValue, TouchableOpacity } from "react-native";
import { BORDER_RADIUS, CENTER, FONT_SIZE, NINETY_P, PADDING } from "../config/constants.config";
import { GREEN_COLOR } from "../config/colors.config";
import CustomText from "./CustomText";

const CustomButton = ({
						  text = "Submit",
						  onPress = () => {
						  },
						  width = NINETY_P,
						  disabled = false,
						  color = GREEN_COLOR
					  }: {
	text?: string;
	onPress?: VoidFunction;
	width?: DimensionValue;
	disabled?: boolean;
	color?: string;
}) => {
	return (
		<TouchableOpacity
			style={{
				backgroundColor: color,
				padding: PADDING,
				borderRadius: BORDER_RADIUS,
				alignItems: CENTER,
				justifyContent: CENTER,
				opacity: disabled ? 0.5 : 1,
				width,
				marginVertical: FONT_SIZE,
				alignSelf: CENTER
			}}
			onPress={onPress}
			disabled={disabled}
		>
			<CustomText text={text} alignSelf={CENTER} />
		</TouchableOpacity>
	);
};

export default CustomButton;
