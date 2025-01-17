import { DimensionValue, TouchableOpacity } from "react-native";
import { GREEN_COLOR } from "../../constants/colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FONT_SIZE,
	PADDING,
	SCREEN_WIDTH,
} from "../../constants/constants.config";
import CustomText from "../CustomText";

const CustomButton = ({
	text = "Submit",
	onPress = () => {},
	width = SCREEN_WIDTH / 2,
	disabled = false,
	color = GREEN_COLOR,
	marginV = FONT_SIZE,
}: {
	text?: string;
	onPress?: VoidFunction;
	width?: DimensionValue;
	disabled?: boolean;
	color?: string;
	marginV?: number;
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
				marginVertical: marginV,
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
