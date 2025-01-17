import { ColorValue, FlexAlignType, Text } from "react-native";
import { PRIMARY_COLOR } from "../constants/colors.config";
import {
	FLEX_START,
	FONT_SIZE,
	UBUNTU_FONT,
} from "../constants/constants.config";

type ITextDecoration =
	| "none"
	| "underline"
	| "line-through"
	| "underline line-through"
	| undefined;

const CustomText = ({
	text,
	fontSize = FONT_SIZE,
	color = PRIMARY_COLOR,
	alignSelf = FLEX_START,
	paddingTop = 0,
	right = 0,
	paddingVertical = 0,
	decoration = undefined,
}: {
	text: string | number;
	fontSize?: number;
	color?: ColorValue;
	alignSelf?: FlexAlignType;
	paddingTop?: number;
	right?: number;
	paddingVertical?: number;
	decoration?: ITextDecoration;
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
				paddingVertical,
			}}
		>
			{text}
		</Text>
	);
};
export default CustomText;
