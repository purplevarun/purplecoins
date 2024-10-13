import { ColorValue, FlexAlignType, Text } from "react-native";
import { primaryColor } from "../config/colors.config";
import { FONT_SIZE } from "../config/dimensions.config";

interface IMyText {
	text: string;
	fontSize?: number;
	color?: ColorValue;
	alignSelf?: FlexAlignType;
}

const ComponentText = ({
	text,
	fontSize = FONT_SIZE,
	color = primaryColor,
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
export default ComponentText;
