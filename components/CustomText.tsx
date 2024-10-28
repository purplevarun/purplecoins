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
}>;

const CustomText: Props = ({
	text,
	fontSize = FONT_SIZE,
	color = PRIMARY_COLOR,
	alignSelf = FLEX_START,
}) => {
	const fontFamily = UBUNTU_FONT;
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
