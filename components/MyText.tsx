import { ColorValue, Text } from "react-native";
import { primaryColor } from "../config/Colors";
import { FONT_SIZE } from "../config/Constants";

interface IMyText {
	text: string;
	useFont?: boolean;
	header?: boolean;
	size?: number;
	color?: ColorValue;
}

const MyText = ({
	text,
	useFont = true,
	header = false,
	size,
	color = primaryColor,
}: IMyText) => {
	const fontFamily = header ? "Fredoka_One" : useFont ? "Fredoka" : "Roboto";
	const fontSize = header ? FONT_SIZE * 1.5 : FONT_SIZE;
	return (
		<Text
			style={{
				color,
				fontFamily,
				fontSize,
			}}
		>
			{text}
		</Text>
	);
};
export default MyText;
