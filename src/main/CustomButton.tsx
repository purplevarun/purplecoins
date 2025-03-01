import { DimensionValue, TouchableOpacity } from "react-native";
import CustomText from "./CustomText";
import { GREEN_COLOR } from "./colors.config";
import {
	BORDER_RADIUS,
	CENTER,
	FONT_SIZE,
	PADDING,
	SCREEN_WIDTH,
} from "./constants.config";

const CustomButton = ({
	text = "Submit",
	onPress = () => {},
	onHold = () => {},
	width = SCREEN_WIDTH / 2,
	disabled = false,
	color = GREEN_COLOR,
	marginV = FONT_SIZE,
	fontSize = FONT_SIZE,
}: {
	text?: string;
	onPress?: VoidFunction;
	onHold?: VoidFunction;
	width?: DimensionValue;
	disabled?: boolean;
	color?: string;
	marginV?: number;
	fontSize?: number;
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
			onLongPress={onHold}
			disabled={disabled}
		>
			<CustomText text={text} alignSelf={CENTER} fontSize={fontSize} />
		</TouchableOpacity>
	);
};

export default CustomButton;
