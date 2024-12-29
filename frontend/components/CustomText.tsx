import { ColorValue, FlexAlignType, Text } from "react-native";
import { PRIMARY_COLOR } from "../config/colors.config";
import { FLEX_START, FONT_SIZE, UBUNTU_FONT } from "../config/constants.config";

const CustomText = ({
	text,
	fontSize = FONT_SIZE,
	color = PRIMARY_COLOR,
	alignSelf = FLEX_START,
	paddingTop = 0,
	right = 0,
	decoration = undefined,
}: {
	text: string | number;
	fontSize?: number;
	color?: ColorValue;
	alignSelf?: FlexAlignType;
	paddingTop?: number;
	right?: number;
	decoration?:
		| "none"
		| "underline"
		| "line-through"
		| "underline line-through"
		| undefined;
}) => {
	const fontFamily = UBUNTU_FONT;
	return (
		<Text
			style={{
				color,
				fontFamily,
				fontSize,
				alignSelf,
				paddingTop,
				right,
				textDecorationLine: decoration,
			}}
		>
			{text}
		</Text>
	);
};
export default CustomText;
