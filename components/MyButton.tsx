import { TouchableOpacity } from "react-native";
import { backgroundColor } from "../config/Colors";
import { padding } from "../config/Constants";
import MyText from "./MyText";

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
				padding,
				width,
				borderRadius: padding,
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
