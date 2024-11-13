import { ColorValue, FlexAlignType, Text } from "react-native";
import { PRIMARY_COLOR } from "../config/colors.config";
import {
	FLEX_START,
	FONT_SIZE,
	PADDING,
	UBUNTU_FONT,
} from "../config/constants.config";
import { FC } from "react";

type Props = FC<{
	text: string | number;
	fontSize?: number;
	color?: ColorValue;
	alignSelf?: FlexAlignType;
	paddingTop?: number;
}>;

const CustomText: Props = ({
	text,
	fontSize = FONT_SIZE,
	color = PRIMARY_COLOR,
	alignSelf = FLEX_START,
	paddingTop = 0,
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
			}}
		>
			{text}
		</Text>
	);
};
export default CustomText;
