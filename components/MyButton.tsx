import { TouchableOpacity } from "react-native";
import MyText from "./MyText";
import { backgroundColor, secondaryColor } from "../config/Colors";

const MyButton = ({
	text,
	onPress,
	width,
}: {
	text: string;
	onPress: VoidFunction;
	width: number;
}) => {
	return (
		<TouchableOpacity
			style={{
				backgroundColor: backgroundColor,
				padding: 10,
				width,
				borderRadius: 10,
				alignItems: "center",
				justifyContent: "center",
			}}
			onPress={onPress}
		>
			<MyText text={text} header />
		</TouchableOpacity>
	);
};
export default MyButton;
