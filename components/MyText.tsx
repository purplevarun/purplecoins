import { ColorValue, Text } from "react-native";
import { primaryColor } from "../config/Colors";

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
	size = 20,
	color = primaryColor,
}: IMyText) => {
	const fontFamily = header ? "Fredoka_One" : useFont ? "Fredoka" : "Roboto";
	const fontSize = header ? 40 : size;
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
