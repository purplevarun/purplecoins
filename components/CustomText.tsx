import { ColorValue, FlexAlignType, Text } from "react-native";
import { PRIMARY_COLOR } from "../config/colors.config";
import { FONT_SIZE, PADDING } from "../config/constants.config";

interface IMyText {
	text: string | number;
	fontSize?: number;
	color?: ColorValue;
	alignSelf?: FlexAlignType;
}

const CustomText = ({
	text,
	fontSize = FONT_SIZE,
	color = PRIMARY_COLOR,
	alignSelf = "flex-start",
}: IMyText) => {
	const fontFamily = "Ubuntu";
	return (
		<Text
			style={{
				color,
				fontFamily,
				fontSize,
				alignSelf,
			}}
		>
			{text}
		</Text>
	);
};
export default CustomText;
